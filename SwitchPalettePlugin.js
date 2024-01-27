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
        var sectionText = store.getRecursiveTiddlerText(this.pluginName + "##" + sectionName, "", 1);
        var css = sectionText.replace(/^\s*{{{((?:.|\n)*?)}}}\s*$/, "$1");
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
        var mainPaletteTitle = this.getMainPaletteTitle();
        var mainPaletteTiddler = store.getTiddler(mainPaletteTitle);
        if (!mainPaletteTiddler) return ["", false];

        var originPaletteTitle = mainPaletteTiddler.fields['from.palette'];
        var originIsDarkMode = mainPaletteTiddler.fields['is.dark.mode'];
        return [originPaletteTitle, originIsDarkMode];
    },

    handler: function (place, macroName, params, wikifier, paramString, sourceTiddler) {
        var args = paramString.parseParams("anon", null, null)[0];
        var params = args.anon || [];
        var sourcePaletteTitle = params[0] || null;
        var isDarkMode = params[1] || false;

        var label = "Switch palette";
        var tooltip = `switch to ${sourcePaletteTitle}`;

        const [originPaletteTitle, originIsDarkMode] = this.getPaletteOrigin();
        if (sourcePaletteTitle == originPaletteTitle) {
            label += " (ON)";
        }

        pluginTiddlerTitle = sourceTiddler.title;

        createTiddlyButton(place, label, tooltip, function () {
            var me = config.macros.switchPalette;
            var mainPaletteTitle = me.getMainPaletteTitle();

            var sourcePaletteTiddler = store.getTiddler(sourcePaletteTitle);
            if (!sourcePaletteTiddler) return;

            var targetPaletteTiddler = new Tiddler(mainPaletteTitle);
            targetPaletteTiddler.text = sourcePaletteTiddler.text;
            targetPaletteTiddler.creator = sourcePaletteTiddler.creator;
            targetPaletteTiddler.modifier = sourcePaletteTiddler.modifier;
            targetPaletteTiddler.created = sourcePaletteTiddler.created;
            targetPaletteTiddler.modified = sourcePaletteTiddler.modified;
            targetPaletteTiddler.links = sourcePaletteTiddler.links;
            targetPaletteTiddler.linksUpdated = sourcePaletteTiddler.linksUpdated;
            targetPaletteTiddler.tags = sourcePaletteTiddler.tags;
            targetPaletteTiddler.fields = sourcePaletteTiddler.fields;

            targetPaletteTiddler.fields['from.palette'] = sourcePaletteTitle;
            targetPaletteTiddler.fields['is.dark.mode'] = isDarkMode;

            store.saveTiddler(targetPaletteTiddler);
            story.refreshTiddler(pluginTiddlerTitle, null, true);

            me.applyAdjustments(isDarkMode);
            refreshColorPalette()
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
