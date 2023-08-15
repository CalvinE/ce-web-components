# ce-themetoggle

A simple theme toggle for switching between `light` and `dark` mode. The `data-current-theme` value on this web component is applied to the target element specified by the `data-target-selector`. On load the the default theme (unless specified by the `data-current-theme` attribute) will be added to the element determined by the `data-target-selector` in the form of adding this attribute to it: `data-current-theme="dark"` or `light` if that is specified on the `ce-themetoggle` element.

When the user clicks the toggle to change the current theme a preference is stored in local storage and will be used by the `ce-themetoggle` on load if the local storage value is present.

The local storage theme preference key is `ce-themetoggle-theme-preference`

## Example usage

```html
<html>
    <head>
        <style>
            :root {
                --light-color: #000000;
                --light-accent-color: #826f10;
                --light-off-color: #e5e5e5;
                --light-background-color: #ffffff;

                --dark-color: #ffffff;
                --dark-accent-color: #fcda1f;
                --dark-off-color: #24292e;
                --dark-background-color: #000000;
            }

            /* We default to dark mode... Because we are civilized */
            [data-current-theme="dark"] {
                --color: var(--dark-color);
                --accent-color: var(--dark-accent-color);
                --off-color: var(--dark-off-color);
                --background-color: var(--dark-background-color);
            }

            [data-current-theme="light"] {
                --color: var(--light-color);
                --accent-color: var(--light-accent-color);
                --off-color: var(--light-off-color);
                --background-color: var(--light-background-color);
            }

            body {
                color: var(--color);
                background-color: var(--background-color);
            }

            span {
                color: var(--accent-color);
            }
        </style>
        <!-- import built JS file or use some bundler to import the TS file! -->
        <script type="text/javascript" src="build/ce-themetoggle.js">
    </head>
    <body>
        <p>Hello <span>ce-themetoggle</span></p>
        <ce-themetoggle >
    </body>
</html>
```

|Attribute Name|Default|Description|
|-----|-----|-----|
|data-target-selector|`body`|A normal CSS selector. **Only one element will get this applied to them `QuerySelector` not `QuerySelectorAll`** Used to specify the target of the theme toggle component. TODO: Should this use `QuerySelectorAll`?|
|data-current-theme|`dark`|`dark` or `light`. Used to specify as an override to set the current theme on load. TODO: make this configurable...|
|data-light-color|`#000000`|Any valid CSS color value. Used to specify the color to apply to this toggle when light mode is applied.|
|data-dark-color|`#FFFFFF`|Any valid CSS color value. Used to specify the  color to apply to this toggle when dark mode is applied.|
|data-toggle-height|`1.5rem`|Any valid CSS size. Used to specify the height of this component on screen. All other dimensions like the size of the toggle knob or event the width of the whole component are calculated based on this value. A default is provided in the HTML template.|
