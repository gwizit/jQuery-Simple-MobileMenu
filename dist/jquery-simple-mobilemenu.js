(function ($) {
	$.fn.simpleMobileMenu = function (options) {
		const defaults = {
			hamburgerId: "sm_menu_ham",
			wrapperClass: "sm_menu_outer",
			submenuClass: "sub-menu",
			menuStyle: "slide",
			menuContainer: null,
			enableBreadcrumbs: false,
			homeText: "Home",
			onMenuLoad: () => true,
			onMenuToggle: () => true,
		};

		const settings = $.extend({}, defaults, options);
		const $menu = this;
		const $hamburger = $("<div/>", {
			id: settings.hamburgerId,
			html: "<span></span><span></span><span></span><span></span>",
		});
	const $breadcrumbDiv = settings.enableBreadcrumbs 
		? $("<div/>", { class: "sm_menu_breadcrumb" })
		: null;
		const $wrapper = $("<div/>", {
			class: `${settings.wrapperClass} ${settings.menuStyle.toLowerCase()}`,
		});
		
		if (settings.enableBreadcrumbs) {
			$wrapper.append($breadcrumbDiv);
		}
		$wrapper.append($menu);

		const updateBreadcrumbs = () => {
			if (!settings.enableBreadcrumbs) return;
			
			// Only show breadcrumbs if menu is active
			if (!$wrapper.hasClass("active")) {
				$breadcrumbDiv.hide();
				return;
			}
			
			let breadcrumbs = [];
			const $activeLi = $wrapper.find("li.active").last();
			
			if ($activeLi.length) {
				$activeLi.parents("li.hasChild").addBack().each(function () {
					const $li = $(this);
					const $anchor = $li.find("> a").first();
					const text = $anchor.text();
					const depth = $li.parents(`ul.${settings.submenuClass}`).length;
					breadcrumbs.push({ text, $li, depth });
				});
			}
			
			$breadcrumbDiv.empty();
			
			// Always show Home link with sm_menu_breadcrumb_links wrapper
			const $linksContainer = $("<div/>", { class: "sm_menu_breadcrumb_links" });
			
			const $homeLink = $("<a/>", {
				href: "#",
			}).append($("<span/>", {
				class: breadcrumbs.length === 0 ? "sm_menu_home active" : "sm_menu_home inactive",
				text: settings.homeText,
			})).on("click", function (e) {
				e.preventDefault();
				// Navigate to root level - remove all active states
				$wrapper.find("li.active").removeClass("active");
				updateBreadcrumbs();
			});
			
			$linksContainer.append($homeLink);
			
			if (breadcrumbs.length > 0) {
				$linksContainer.append($("<span/>", { class: "sm_menu_breadcrumb_seperator" }));
				
				breadcrumbs.forEach((crumb, index) => {
					const isLast = index === breadcrumbs.length - 1;
					const $span = $("<span/>", { text: crumb.text });
					if (isLast) {
						$span.addClass("active");
					}
					const $link = $("<a/>", {
						href: "#",
					}).append($span).on("click", function (e) {
						e.preventDefault();
						// Navigate to this breadcrumb level
						// Remove active from all items deeper than this level
						const $childSubmenu = crumb.$li.find(`> .${settings.submenuClass}`);
						if ($childSubmenu.length) {
							$childSubmenu.find("li.active").removeClass("active");
						}
						updateBreadcrumbs();
					});
					
					$linksContainer.append($link);
					if (!isLast) {
						$linksContainer.append($("<span/>", { class: "sm_menu_breadcrumb_seperator" }));
					}
				});
		}
		
		$breadcrumbDiv.append($linksContainer);
		$breadcrumbDiv.show();
		
		// Adjust menu positioning based on breadcrumb height
		adjustMenuPosition();
	};
	
	const adjustMenuPosition = () => {
		if (!settings.enableBreadcrumbs || !$breadcrumbDiv) return;
		
		// Wait for DOM to render breadcrumb changes
		setTimeout(() => {
			const breadcrumbHeight = $breadcrumbDiv.outerHeight();
			
			// Update CSS custom property for dynamic positioning
			$wrapper[0].style.setProperty('--breadcrumb-height', `${breadcrumbHeight}px`);
			
			// Adjust main menu top margin
			$menu.css('margin-top', `${breadcrumbHeight}px`);
			
			// Adjust submenus padding-top
			$wrapper.find(`.${settings.submenuClass}`).css('padding-top', `${breadcrumbHeight}px`);
		}, 10);
	};		const createBackButton = () => {
			$wrapper.find(`ul.${settings.submenuClass}`).each(function () {
				const $submenu = $(this);
				const $parentLi = $submenu.closest("li");
			const $firstAnchor = $parentLi.find("> a");
			const $backLink = $("<li/>", {
				class: "back",
				html: `<a href='#'>${$firstAnchor.text()}</a>`
			});				$parentLi.addClass("hasChild");
				if (settings.menuStyle.toLowerCase() === "slide") {
					$backLink.prependTo($submenu);
				}
			});
		};

	const toggleMobileMenu = () => {
		const $hamburger = $("#" + settings.hamburgerId);
		const $wrapper = $("." + settings.wrapperClass);

		$hamburger.toggleClass("open");
		$wrapper.toggleClass("active").find("li.active").removeClass("active");
		$("body").toggleClass("mmactive");
		
		// Toggle display property - show when active, hide when not
		if ($wrapper.hasClass("active")) {
			$wrapper.css("display", "block");
		} else {
			$wrapper.css("display", "none");
		}

		if (settings.menuStyle.toLowerCase() === "accordion") {
			$wrapper.find(`ul.${settings.submenuClass}`).hide();
		}
		
		// Reset breadcrumbs when closing menu
		if (settings.enableBreadcrumbs) {
			if (!$hamburger.hasClass("open")) {
				$breadcrumbDiv.hide();
			} else {
				// Adjust positioning when opening menu
				adjustMenuPosition();
			}
		}
		
		updateBreadcrumbs();
		settings.onMenuToggle($menu, $hamburger.hasClass("open"));
	};		const showSlideSubMenu = function (e) {
		e.preventDefault();
		const $parentLi = $(this).parent();
		$parentLi.addClass("active").siblings().removeClass("active");
		const $submenu = $parentLi.find(`> .${settings.submenuClass}`);
		
		// Account for breadcrumb height when scrolling to submenu
		// Only scroll if breadcrumbs are enabled and visible
		if (settings.enableBreadcrumbs && $breadcrumbDiv && $breadcrumbDiv.is(':visible')) {
			const breadcrumbHeight = $breadcrumbDiv.outerHeight();
			// Keep menu scrolled to show breadcrumbs at top
			$wrapper.scrollTop(0);
		} else {
			const submenuTop =
				$submenu.offset().top - $wrapper.offset().top + $wrapper.scrollTop();
			$wrapper.scrollTop(submenuTop);
		}
		updateBreadcrumbs();
	};		const showAccordionSubMenu = function (e) {
			e.preventDefault();
			const $this = $(this);
			const $parent = $this.parent();
			const $lastActive = $parent.siblings(".active");

			$parent.find(`> .${settings.submenuClass}`).slideToggle(() => {
				if ($(this).is(":visible")) {
					const offset = $this[0].offsetTop;
					$wrapper.stop().animate({ scrollTop: offset }, 300);
				}
			});

			$lastActive.find(`ul.${settings.submenuClass}`).slideUp(() => {
				$(this).find(".hasChild").removeClass("active");
			});

			$parent.toggleClass("active").siblings().removeClass("active");
			updateBreadcrumbs();
		};

		const goBack = function (e) {
			e.preventDefault();
			$(this)
				.closest(`ul.${settings.submenuClass}`)
				.parent()
				.removeClass("active");
			updateBreadcrumbs();
		};

	// Initialization
	$menu.appendTo($wrapper);
	
	// Append to menuContainer if provided, otherwise to body
	const $container = settings.menuContainer && $(settings.menuContainer).length 
		? $(settings.menuContainer) 
		: $("body");
	$hamburger.add($wrapper).appendTo($container);
	
	createBackButton();
	
	// Initialize breadcrumbs
	if (settings.enableBreadcrumbs) {
		updateBreadcrumbs();
	}
	
	// Event listeners using .on('click', function)
		$hamburger.on("click", toggleMobileMenu);
		$wrapper
			.filter(".slide")
			.find("li.hasChild > a")
			.on("click", showSlideSubMenu);
		$wrapper
			.filter(".accordion")
			.find("li.hasChild > a")
			.on("click", showAccordionSubMenu);
		$wrapper.find("li.back a").on("click", goBack);

		// Callback - Menu loaded
		settings.onMenuLoad($menu);

		return this;
	};
})(jQuery);
