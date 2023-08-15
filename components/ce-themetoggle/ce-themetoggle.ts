/**
 * Like a C include guard. 
 * If the element is already registered we don't want to try and register it again...
 */
if (!document.getElementById("ce-themetoggle-template")) {
    const template = document.createElement('template')
    template.id = "ce-themetoggle-template"
    const templateText =
        `
        <style>
            label.visual-toggle {
                --toggle-height: 1.5rem;
                --toggle-width: calc(var(--toggle-height) * (2 / 3 + 1));
                --lr-padding: calc(var(--toggle-width) * 0.05);
                --border-width: calc(var(--toggle-height) * 0.1);
                --border-radius: 1000px;
                --toggle-color: #000;
                width: var(--toggle-width);
                height: var(--toggle-height);
                position: relative;
                border: var(--border-width) solid var(--toggle-color);
                border-radius: var(--border-radius);
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                box-sizing: content-box;
                padding-left: var(--lr-padding);
                padding-right: var(--lr-padding);
            }
        
            label.visual-toggle[data-current-theme="dark"] {
                --toggle-color: #FFF;
            }
        
            span.toggle-switch {
                --left: 0.75;
                --right: 0.9;
                --switch-height: calc(var(--toggle-height) * 0.70);
                --switch-width: var(--switch-height);
                --toggled-pos: calc(var(--toggle-width) - var(--switch-width));
                height: var(--switch-height);
                width: var(--switch-width);
                background-color: var(--toggle-color);
                box-sizing: border-box;
                border-radius: var(--border-radius);
                transition: all 0.5s linear;
            }
        
            input.theme-toggle:checked + span.toggle-switch {
                transform: translateX(var(--toggled-pos));
                background-color: var(--toggle-color);
            }
        
            input.theme-toggle[type="checkbox"] {
                display: none;
            }
        </style>
        <label class="visual-toggle">
            <input type="checkbox" class="theme-toggle" />
            <span class="toggle-switch"> </span>
        </label>
        `;
    template.innerHTML = templateText;
    document.body.appendChild(template);
}

/**
 * Like a C include guard. 
 * If the element is already registered we don't want to try and register it again...
 */
if (!customElements.get("ce-themetoggle")) {
    class ThemeToggle extends HTMLElement {

        private targetSelectorAttr: string;
        private currentThemeAttr: string;
        private lightColorAttr: string;
        private darkColorAttr: string;
        private toggleHeightAttr: string;

        private checkboxElement: HTMLInputElement | null;
        private toggleContainerElement: HTMLLabelElement | null;
        private toggleKnobElement: HTMLSpanElement | null;

        constructor() {
            super();
            this.targetSelectorAttr = "body";
            this.currentThemeAttr = ThemeToggle.defaultTheme;
            this.lightColorAttr = "#000000";
            this.darkColorAttr = "#FFFFFF";
            this.toggleHeightAttr = "1.5rem";
            this.checkboxElement = null;
            this.toggleContainerElement = null;
            this.toggleKnobElement = null;
            const template = document.getElementById("ce-themetoggle-template");
            const templateContent = (template as HTMLTemplateElement).content;

            this.attachShadow(
                {
                    mode: "open",
                }
            ).appendChild(templateContent.cloneNode(true));
        }

        static get observedAttributes() {
            return [
                ThemeToggle.targetSelectorAttrName,
                ThemeToggle.currentThemeAttrName,
                ThemeToggle.darkColorAttrName,
                ThemeToggle.lightColorAttrName,
                ThemeToggle.toggleHeightAttrName,
            ];
        }

        /**
         * The attribute name that is used to specify the target of the theme toggle component.
         */
        static get targetSelectorAttrName() {
            return "data-target-selector";
        }

        /**
         * The attribute name that is used to specify as an override to set the current theme on load.
         */
        static get currentThemeAttrName() {
            return "data-current-theme";
        }

        /**
         * The attribute name that is used to specify the color to apply to this toggle when light mode is applied.
         */
        static get lightColorAttrName() {
            return "data-light-color";
        }

        /**
         * The attribute name that is used to specify the  color to apply to this toggle when dark mode is applied.
         */
        static get darkColorAttrName() {
            return "data-dark-color";
        }

        /**
         * The attribute name that is used to specify the height of this component on screen.
         * All other dimensions like the size of the toggle knob or event the width of the whole component are calculated based on this value.
         * A default is provided in the HTML template.
         */
        static get toggleHeightAttrName() {
            return "data-toggle-height";
        }

        /**
         * The name use to represent dark mode. Really just here to avoid typos ;-)
         */
        static get darkThemeName() {
            return "dark";
        }

        /**
         * The name use to represent light mode. Really just here to avoid typos ;-)
         */
        static get lightThemeName() {
            return "light";
        }

        /**
         * The name of the value in local storage to save theme preference.
         */
        private static get themePreferenceName() {
            return "ce-themetoggle-theme-preference";
        }

        /**
         * Tells us the default theme.
         * TODO: make this configurable...
         */
        static get defaultTheme() {
            return ThemeToggle.darkThemeName
        }

        /**
         * Tells us the alternate theme.
         * TODO: derive based on default theme.
         */
        static get secondaryTheme() {
            return ThemeToggle.lightThemeName
        }

        /**
         * Handles setting everything up when the node is attached to the dom.
         */
        connectedCallback() {
            // handle checkbox stuff
            this.checkboxElement = (this.shadowRoot?.querySelector("input.theme-toggle") as HTMLInputElement | null);
            if (this.checkboxElement === null) {
                throw new Error("ce-themetoggle: some how the check box element from the template does not exist...");
            }
            this.toggleContainerElement = (this.shadowRoot?.querySelector("label.visual-toggle") as HTMLLabelElement | null);
            if (this.toggleContainerElement === null) {
                throw new Error("ce-themetoggle: some how the toggle container element from the template does not exist...");
            }
            this.toggleKnobElement = (this.shadowRoot?.querySelector("span.toggle-switch") as HTMLSpanElement | null);
            if (this.toggleKnobElement === null) {
                throw new Error("ce-themetoggle: some how the toggle knob element from the template does not exist...");
            }
            this.checkboxElement.addEventListener("change", (e) => {
                const checked = (e.target as HTMLInputElement).checked;
                this.handleThemeChange("", checked ? ThemeToggle.defaultTheme : ThemeToggle.secondaryTheme, false)
            });

            this.targetSelectorAttr = this.getAttribute(ThemeToggle.targetSelectorAttrName) ?? "body";
            const currentThemePreference = this.getThemePreference()
            if (this.hasAttribute(ThemeToggle.currentThemeAttrName)) {
                // Get preference from specified attribute from this element.
                this.currentThemeAttr = this.getAttribute(ThemeToggle.currentThemeAttrName) ?? ThemeToggle.darkThemeName;
            } else if (currentThemePreference) {
                // Get preference from local storage value if present.
                this.currentThemeAttr = currentThemePreference;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                // No specific theme provided and not saved preference found. See if system preference is light mode and if it is use that.
                this.currentThemeAttr = ThemeToggle.lightThemeName;
            } else {
                // Catch all is dark mode because it is superior.
                this.currentThemeAttr = ThemeToggle.darkThemeName;
            }
            if (this.currentThemeAttr == ThemeToggle.defaultTheme) {
                // TODO: Should this be true if the secondary theme is selected?
                this.checkboxElement.checked = true;
            }
            this.handleTargetChange("", this.targetSelectorAttr, true);
        }

        /**
         * This is triggered any time an attribute is added / changed if it is in the static array observedAttributes in this class.
         * @param {string} name The name of the attribute
         * @param {string} oldValue The previous value of the attribute
         * @param {string} newValue The new value of the attribute
         */
        attributeChangedCallback(name: string, oldValue: string, newValue: string) {
            console.log('Toggle theme element attributes changed.', { name, oldValue, newValue });
            switch (name) {
                case ThemeToggle.toggleHeightAttrName:
                    this.toggleHeightAttr = newValue;
                    this.toggleContainerElement?.style.setProperty("--toggle-height", this.toggleHeightAttr);
                    break;
                case ThemeToggle.lightColorAttrName:
                    this.lightColorAttr = newValue;
                    if (this.currentThemeAttr === ThemeToggle.lightThemeName) {
                        this.toggleContainerElement?.style.setProperty("--toggle-color", this.lightColorAttr);
                    }
                    break;
                case ThemeToggle.darkColorAttrName:
                    this.darkColorAttr = newValue;
                    if (this.currentThemeAttr === ThemeToggle.darkThemeName) {
                        this.toggleContainerElement?.style.setProperty("--toggle-color", this.darkColorAttr);
                    }
                    break;
                case ThemeToggle.targetSelectorAttrName:
                    this.handleTargetChange(oldValue, newValue);
                    break;
                case ThemeToggle.currentThemeAttrName:
                    this.handleThemeChange(oldValue, newValue)
                    break;
            }
        }

        private setThemePreference(theme: string) {
            window.localStorage.setItem(ThemeToggle.themePreferenceName, theme)
        }

        private getThemePreference(): string | null {
            return window.localStorage.getItem(ThemeToggle.themePreferenceName)
        }

        private handleTargetChange(oldValue: string, newValue: string, force: boolean = false) {
            if (this.targetSelectorAttr === newValue && !force) {
                return;
            }
            if (oldValue) {
                const oldTargets = this.querySelectorAll(oldValue);
                for (const ot of oldTargets) {
                    ot.removeAttribute(ThemeToggle.targetSelectorAttrName);
                }
            }
            this.targetSelectorAttr = newValue;
            this.handleThemeChange("", this.currentThemeAttr, true)
            this.setAttribute(ThemeToggle.targetSelectorAttrName, newValue);
        }

        private handleThemeChange(_: string, newValue: string, force: boolean = false) {
            if (this.currentThemeAttr === newValue && !force) {
                return;
            }
            const targets = document.querySelectorAll(this.targetSelectorAttr)
            let normalizedValue = "";
            switch (newValue?.toLowerCase()) {
                case ThemeToggle.lightThemeName:
                    normalizedValue = ThemeToggle.lightThemeName;
                    break;
                case ThemeToggle.darkThemeName:
                    normalizedValue = ThemeToggle.darkThemeName;
                    break;
                default:
                    normalizedValue = ThemeToggle.darkThemeName;
                    break;
            }
            for (const t of targets) {
                t.setAttribute(ThemeToggle.currentThemeAttrName, normalizedValue);
                this.currentThemeAttr = normalizedValue;
            }
            if (!force) {
                this.setThemePreference(this.currentThemeAttr);
            }
            this.toggleContainerElement?.style.setProperty("--toggle-color", this.currentThemeAttr == ThemeToggle.darkThemeName ? this.darkColorAttr : this.lightColorAttr);
            this.setAttribute(ThemeToggle.currentThemeAttrName, normalizedValue);
        }
    }

    // Register the web component so we can use it.
    customElements.define("ce-themetoggle", ThemeToggle);
}