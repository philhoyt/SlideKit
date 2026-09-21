/**
 * SlideKit front end.
 *
 * Boots one Embla instance per slider, renders the controls the block saved
 * placeholders for, and layers on ARIA, keyboard support and reduced-motion
 * handling. Nothing here depends on Embla class names, so the saved markup
 * stays library-agnostic.
 */

/* global IntersectionObserver */

import EmblaCarousel from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';

const SELECTOR = '.wp-block-slidekit-slider';

const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );

/**
 * Read a boolean data attribute. Missing attributes default to `fallback`.
 *
 * @param {DOMStringMap} dataset  Element dataset.
 * @param {string}       key      Camel-cased key.
 * @param {boolean}      fallback Default when absent.
 * @return {boolean} Parsed value.
 */
function flag( dataset, key, fallback ) {
	if ( ! ( key in dataset ) ) {
		return fallback;
	}
	return dataset[ key ] === 'true';
}

/**
 * Dispatch a bubbling custom event so themes can react to slider activity.
 *
 * @param {Element} target Element to dispatch from.
 * @param {string}  name   Event name, without the "slidekit:" prefix.
 * @param {Object}  detail Event detail.
 */
function emit( target, name, detail = {} ) {
	target.dispatchEvent(
		new CustomEvent( `slidekit:${ name }`, { bubbles: true, detail } )
	);
}

/**
 * Wire arrows, pagination, ARIA and keyboard for one slider element.
 *
 * @param {HTMLElement} root The .wp-block-slidekit-slider element.
 */
function initSlider( root ) {
	if ( root.dataset.slidekitReady ) {
		return;
	}
	root.dataset.slidekitReady = 'true';

	const viewport = root.querySelector( '.slidekit__viewport' );
	const container = root.querySelector( '.slidekit__container' );
	if ( ! viewport || ! container ) {
		return;
	}

	const d = root.dataset;
	const loop = flag( d, 'loop', true );
	const centered = flag( d, 'centered', false );
	const isFade = d.effect === 'fade';
	const autoplayWanted = flag( d, 'autoplay', false );
	const autoplayDelay = parseInt( d.autoplayDelay, 10 ) || 4000;

	const plugins = [];
	if ( isFade ) {
		plugins.push( Fade() );
	}
	if ( autoplayWanted && ! reducedMotion.matches ) {
		plugins.push(
			Autoplay( {
				delay: autoplayDelay,
				playOnInit: false,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
				stopOnFocusIn: true,
			} )
		);
	}

	const embla = EmblaCarousel(
		viewport,
		{
			loop,
			align: centered ? 'center' : 'start',
			containScroll: centered ? false : 'trimSnaps',
			skipSnaps: false,
			duration: reducedMotion.matches ? 0 : 25,
		},
		plugins
	);

	const slides = embla.slideNodes();
	const total = slides.length;

	// Expose the instance for themes and for debugging: element.slidekit.
	root.slidekit = embla;

	// --- ARIA on slides -------------------------------------------------------
	slides.forEach( ( slide, i ) => {
		slide.setAttribute( 'role', 'group' );
		slide.setAttribute( 'aria-roledescription', 'slide' );
		if ( ! slide.hasAttribute( 'aria-label' ) ) {
			slide.setAttribute( 'aria-label', `${ i + 1 } / ${ total }` );
		}
	} );

	// --- Arrows ---------------------------------------------------------------
	const prev = root.querySelector( '.slidekit__arrow--prev' );
	const next = root.querySelector( '.slidekit__arrow--next' );
	if ( prev ) {
		prev.addEventListener( 'click', () => embla.scrollPrev() );
	}
	if ( next ) {
		next.addEventListener( 'click', () => embla.scrollNext() );
	}

	function syncStatic() {
		// One snap point means every slide already fits: nothing to slide.
		root.classList.toggle(
			'is-static',
			embla.scrollSnapList().length <= 1
		);
	}

	function syncArrows() {
		if ( prev ) {
			prev.toggleAttribute( 'disabled', ! embla.canScrollPrev() );
		}
		if ( next ) {
			next.toggleAttribute( 'disabled', ! embla.canScrollNext() );
		}
	}

	// --- Pagination -----------------------------------------------------------
	const pagination = root.querySelector( '.slidekit__pagination' );
	const paginationType = pagination
		? [ 'dots', 'fraction', 'progress' ].find( ( type ) =>
				pagination.classList.contains(
					`slidekit__pagination--${ type }`
				)
			)
		: null;

	let dots = [];
	let fraction = null;
	let progressBar = null;

	function buildDots() {
		pagination.innerHTML = '';
		dots = embla.scrollSnapList().map( ( _, i ) => {
			const dot = document.createElement( 'button' );
			dot.type = 'button';
			dot.className = 'slidekit__dot';
			dot.setAttribute( 'aria-label', `${ i + 1 } / ${ total }` );
			dot.addEventListener( 'click', () => embla.scrollTo( i ) );
			pagination.appendChild( dot );
			return dot;
		} );
	}

	if ( paginationType === 'dots' ) {
		buildDots();
	} else if ( paginationType === 'fraction' ) {
		fraction = document.createElement( 'span' );
		fraction.className = 'slidekit__fraction';
		pagination.appendChild( fraction );
	} else if ( paginationType === 'progress' ) {
		progressBar = pagination.querySelector( '.slidekit__progress-bar' );
	}

	function syncPagination() {
		const index = embla.selectedScrollSnap();
		if ( dots.length ) {
			dots.forEach( ( dot, i ) => {
				const selected = i === index;
				dot.classList.toggle( 'is-selected', selected );
				if ( selected ) {
					dot.setAttribute( 'aria-current', 'true' );
				} else {
					dot.removeAttribute( 'aria-current' );
				}
			} );
		}
		if ( fraction ) {
			fraction.textContent = `${ index + 1 } / ${ embla.scrollSnapList().length }`;
		}
	}

	function syncProgress() {
		if ( ! progressBar ) {
			return;
		}
		const p = Math.max( 0, Math.min( 1, embla.scrollProgress() ) );
		progressBar.style.transform = `scaleX(${ p })`;
	}

	// --- Live region and slide events -----------------------------------------
	const live = root.querySelector( '.slidekit__live' );
	let previousIndex = embla.selectedScrollSnap();

	function announce() {
		if ( live ) {
			live.textContent = `${ embla.selectedScrollSnap() + 1 } / ${ total }`;
		}
	}

	function onSelect() {
		const index = embla.selectedScrollSnap();
		const leaving = slides[ previousIndex ];
		const active = slides[ index ];
		if ( leaving && leaving !== active ) {
			emit( leaving, 'slide:leaving', { index: previousIndex, embla } );
		}
		if ( active ) {
			emit( active, 'slide:active', { index, embla } );
		}
		previousIndex = index;
		syncArrows();
		syncPagination();
		announce();
	}

	// --- Keyboard: arrow keys while the viewport has focus ---------------------
	viewport.addEventListener( 'keydown', ( event ) => {
		if ( event.key === 'ArrowRight' ) {
			embla.scrollNext();
			event.preventDefault();
		} else if ( event.key === 'ArrowLeft' ) {
			embla.scrollPrev();
			event.preventDefault();
		}
	} );

	// --- Lazy images inside a loop can miss their intersection; load them now.
	container.querySelectorAll( 'img[loading="lazy"]' ).forEach( ( img ) => {
		img.loading = 'eager';
	} );

	// --- Autoplay: only run while on screen ------------------------------------
	const autoplay = embla.plugins().autoplay;
	if ( autoplay ) {
		const io = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					if ( entry.isIntersecting ) {
						autoplay.play();
					} else {
						autoplay.stop();
					}
				} );
			},
			{ rootMargin: '100px' }
		);
		io.observe( root );
	}

	embla
		.on( 'select', onSelect )
		.on( 'scroll', syncProgress )
		.on( 'reInit', () => {
			if ( paginationType === 'dots' ) {
				buildDots();
			}
			syncStatic();
			syncArrows();
			syncPagination();
			syncProgress();
		} );

	syncStatic();
	syncArrows();
	syncPagination();
	syncProgress();
	emit( root, 'init', { embla } );
	if ( slides[ previousIndex ] ) {
		emit( slides[ previousIndex ], 'slide:active', {
			index: previousIndex,
			embla,
		} );
	}
}

function initAll() {
	document.querySelectorAll( SELECTOR ).forEach( initSlider );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAll );
} else {
	initAll();
}
