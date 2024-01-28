/***
|''Name''|{{{SwitchPalettePlugin}}}|
|''Description''|Allows to switch among color palettes by the {{{switchPalette}}} macro|
|''Author''|Pengju Yan|
|''Version''|1.0.0|
|''Source''|[[DarkModePlugin.js|https://github.com/PengjuYan/TiddlyWiki_SwitchPalettePlugin/blob/master/DarkModePlugin.js]]|
|''License''|[[MIT|https://github.com/PengjuYan/TiddlyWiki_SwitchPalettePlugin/blob/master/LICENSE]]|
|''Acknowledgements''|Inspired by Yakov Litvin's [[DarkModePlugin|https://github.com/YakovL/TiddlyWiki_DarkModePlugin/]]|
!!! Switch Form
|<<switchPalette "ColorPalette (original)">>|[[ColorPalette (original)]]|
|<<switchPalette "ColorPalette (original reversed)" true>>|[[ColorPalette (original reversed)]]|
|<<switchPalette "ColorPalette (jermolene)">>|[[ColorPalette (jermolene)]]|
|<<switchPalette "ColorPalette (jermolene reversed)" true>>|[[ColorPalette (jermolene reversed)]]|
|<<switchPalette "ColorPalette (yakovl dark)" true>>|[[ColorPalette (yakovl dark)]]|
|<<switchPalette "ColorPalette (pengju dark)" true>>|[[ColorPalette (pengju dark)]]|
!!!Code
***/
//{{{
config.macros.switchPalette = {
    getMainPaletteTitle: function () {
        return "ColorPalette";
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

    getPaletteOrigin: function () {
        const mainPaletteTitle = this.getMainPaletteTitle();
        const mainPaletteTiddler = store.getTiddler(mainPaletteTitle);
        if (!mainPaletteTiddler) return ["", false];

        const originPaletteTitle = mainPaletteTiddler.fields['from.palette'];
        const originIsDarkMode = mainPaletteTiddler.fields['is.dark.mode'];
        return [originPaletteTitle, originIsDarkMode];
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

            saveChanges();
        });
    }
};
//}}}
/***
!!!FollowDarkMode
{{{
.darkMode {
    color-scheme: dark;
}
}}}
***/
