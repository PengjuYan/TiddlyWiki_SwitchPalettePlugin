/***
!!! Plugin info
|''Name''|{{{SwitchPalettePlugin}}}|
|''Description''|Allows you to switch among color palettes by the {{{switchPalette}}} macro|
|''Author''|Pengju Yan|
|''Version''|1.0.1|
|''Source''|https://github.com/PengjuYan/TiddlyWiki_SwitchPalettePlugin/blob/master/SwitchPalettePlugin.js|
|''Documentation''|[[SwitchPalettePlugin on github.io|https://pengjuyan.github.io/TiddlyWiki_SwitchPalettePlugin/]]|
|''License''|[[MIT|https://github.com/PengjuYan/TiddlyWiki_SwitchPalettePlugin/blob/master/LICENSE]]|
|''Acknowledgements''|Forked from and inspired by Yakov Litvin's [[DarkModePlugin|https://github.com/YakovL/TiddlyWiki_DarkModePlugin/]]|
!!! Installation
Just import or copy the plugin with the {{{systemConfig}}} tag, then reload.
!!! Usage
# ''Warning'': Your original [[ColorPalette]] will be ''overwritten'' by the {{{switchPalette}}} macro, or more precisely, by clicking any button created by the macro. So, you'll need to backup your previous [[ColorPalette]] tiddler before you try it!
# Import or create color palette tiddlers as you like. You can use any title for each tiddler.
# Use the {{{switchPalette}}} macro anywhere in your TiddlyWiki, not necessarily in this plugin tiddler. Designate the color palette title as the first argument to the macro.
# The macro just creates and displays a {{{Switch palette}}} button in the hosting tiddler.
# Click such a button then the associated color palette tiddler will be ''saved'' to the [[ColorPalette]] tiddler. The colored appearance of your TiddlyWiki will change accordingly.
!!! Color palette switch form
Follow what is shown below in your own tiddlers elsewhere.
|<<switchPalette "ColorPalette (original)">>|[[ColorPalette (original)]]|
|<<switchPalette "ColorPalette (original reversed)" true>>|[[ColorPalette (original reversed)]]|
|<<switchPalette "ColorPalette (jermolene)">>|[[ColorPalette (jermolene)]]|
|<<switchPalette "ColorPalette (jermolene reversed)" true>>|[[ColorPalette (jermolene reversed)]]|
|<<switchPalette "ColorPalette (yakovl dark)" true>>|[[ColorPalette (yakovl dark)]]|
|<<switchPalette "ColorPalette (pengju dark)" true>>|[[ColorPalette (pengju dark)]]|
!!! Syntax
The {{{switchPalette}}} macro will display a button shown as {{{Switch palette}}}. For the palette in effect in use, {{{(ON)}}} will be appended to the displayed button text.
{{{
<<switchPalette "your color palette tiddler title" "is dark mode or not">>
}}}
You can designate if a color palette is ''dark mode'' or not. See blow for more description on it.
!!! Dark mode configuration
You may want to apply some global while finer grained styles to all dark mode color palettes uniformly. Passing a boolean flag as the second argument to the macro enables the mechanism.

When the dark mode argument is {{{true}}}, the {{{darkMode}}} class is added to the {{{html}}} element. This allows you to add ''styles for dark mode'' only, like this:
{{{
.viewer code,
.viewer pre { color: #0000CD; }

.darkMode code,
.darkMode pre { color: #9ACD32; }
}}}

Ordinary styles are applied to both modes, but {{{.darkMode}}} ones have higher precedence and ''overwrite'' the ordinary ones.

The fine grained styles for the dark mode can be ''customized'' by editing [[StyleSheet]].

Note that the section {{{FollowDarkMode}}} below is part of the magic behind, so don't delete it. Of course you can modify it if you know what you are doing.
!!! Development
This work was inspired by Yakov Litvin's [[DarkModePlugin|https://github.com/YakovL/TiddlyWiki_DarkModePlugin/]] and was started by forking from it.

Learning from {{{DarkModePlugin}}}:
# The {{{TiddlerInFilePlugin.js}}} is a very nice helper for plugin development.
# I followed the {{{createTiddlyButton()}}} way for the user to interact with the macro.
# The {{{darkMode}}} mechanism was inherited.
# Release plugin document to {{{GitHub Pages}}}.

{{{SwitchPalettePlugin}}} features (c.f. {{{DarkModePlugin}}}):
|!{{{SwitchPalettePlugin}}}|!{{{DarkModePlugin}}}|
|The users takes full control. They change color palette only when they want to.|Automatically switch to dark mode on startup if the dark mode is set system wide.|
|Releases several reversed color palette, including {{{DarkModePlugin}}}'s {{{ColorPaletteDark}}} (renamed to [[ColorPalette (yakovl dark)]]).|Releases a dark mode color palette: {{{ColorPaletteDark}}}.|
!!! Code
***/
//{{{
config.macros.switchPalette = {
    getMainPaletteTitle: function () {
        return "ColorPalette";
    },

    getPaletteOrigin: function () {
        const mainPaletteTitle = this.getMainPaletteTitle();
        const mainPaletteTiddler = store.getTiddler(mainPaletteTitle);
        if (!mainPaletteTiddler) return ["", false];

        const originPaletteTitle = mainPaletteTiddler.fields['from.palette'];
        const originIsDarkMode = mainPaletteTiddler.fields['is.dark.mode'];
        return [originPaletteTitle, originIsDarkMode];
    },

    applySectionCSS: function (sectionName) {
        const sectionText = store.getRecursiveTiddlerText(this.pluginName + "##" + sectionName, "", 1);
        const css = sectionText.replace(/^\s*{{{((?:.|\n)*?)}}}\s*$/, "$1");
        return setStylesheet(css, sectionName);
    },

    applyAdjustments: function (isDarkMode) {
        if (isDarkMode) {
            jQuery('html').addClass('darkMode');
            this.applySectionCSS("FollowDarkMode");
        } else {
            jQuery('html').removeClass('darkMode');
            removeStyleSheet("FollowDarkMode");
        }
    },

    onStartup: function () {
        const [originPaletteTitle, originIsDarkMode] = this.getPaletteOrigin();
        this.applyAdjustments(originIsDarkMode);
    },

    handler: function (place, macroName, params, wikifier, paramString, sourceTiddler) {
        const args = paramString.parseParams("anon", null, null)[0];
        const pParams = args.anon || [];
        const sourcePaletteTitle = pParams[0] || null;
        const isDarkMode = pParams[1] || false;

        let label = "Switch palette";
        const tooltip = `switch to ${sourcePaletteTitle}`;

        const [originPaletteTitle, originIsDarkMode] = this.getPaletteOrigin();
        if (sourcePaletteTitle == originPaletteTitle) {
            label += " (ON)";
        }

        createTiddlyButton(place, label, tooltip, function () {
            const me = config.macros.switchPalette;
            const mainPaletteTitle = me.getMainPaletteTitle();

            const sourcePaletteTiddler = store.getTiddler(sourcePaletteTitle);
            if (!sourcePaletteTiddler) return;

            let targetPaletteTiddler = new Tiddler(mainPaletteTitle);
            targetPaletteTiddler.text = sourcePaletteTiddler.text;
            targetPaletteTiddler.creator = sourcePaletteTiddler.creator;
            targetPaletteTiddler.modifier = sourcePaletteTiddler.modifier;
            targetPaletteTiddler.created = sourcePaletteTiddler.created;
            targetPaletteTiddler.modified = sourcePaletteTiddler.modified;
            targetPaletteTiddler.links = sourcePaletteTiddler.links;
            targetPaletteTiddler.linksUpdated = sourcePaletteTiddler.linksUpdated;
            targetPaletteTiddler.tags = sourcePaletteTiddler.tags;

            Object.assign(targetPaletteTiddler.fields, sourcePaletteTiddler.fields);
            targetPaletteTiddler.fields['from.palette'] = sourcePaletteTitle;
            targetPaletteTiddler.fields['is.dark.mode'] = isDarkMode;

            store.saveTiddler(targetPaletteTiddler);
            story.refreshAllTiddlers();

            me.applyAdjustments(isDarkMode);
            refreshColorPalette();

            autoSaveChanges();
        });
    }
};

config.macros.switchPalette.onStartup();
//}}}
/***
!!! FollowDarkMode
{{{
.darkMode {
    color-scheme: dark;
}
}}}
***/
