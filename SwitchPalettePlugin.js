/***
|''Name''|SwitchColorPalettePlugin|
|''Description''|This plugin allows the user to switch between color palettes by the {{{switchColorPalette}}} macro|
|''Author''|Pengju Yan|
|''Version''|1.0.0|
|''Source''|https://github.com/PengjuYan/TiddlyWiki_SwitchPalettePlugin/blob/master/DarkModePlugin.js|
|''License''|[[MIT|https://github.com/PengjuYan/TiddlyWiki_SwitchPalettePlugin/blob/master/LICENSE]]|
!!! Switch Form
|<<switchColorPalette "ColorPalette (original)">>|[[ColorPalette (original)]]|
|<<switchColorPalette "ColorPalette (original reversed)" true>>|[[ColorPalette (original reversed)]]|
|<<switchColorPalette "ColorPalette (jermolene)">>|[[ColorPalette (jermolene)]]|
|<<switchColorPalette "ColorPalette (jermolene reversed)" true>>|[[ColorPalette (jermolene reversed)]]|
|<<switchColorPalette "ColorPalette (yakovl dark)" true>>|[[ColorPalette (yakovl dark)]]|
|<<switchColorPalette "ColorPalette (pengju dark)" true>>|[[ColorPalette (pengju dark)]]|
!!!Code
***/
//{{{
config.macros.switchColorPalette = {
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

    handler: function (place, macroName, params, wikifier, paramString, sourceTiddler) {
        var args = paramString.parseParams("anon", null, null)[0];
        var params = args.anon || [];
        var colorPaletteTitle = params[0] || null;
        var isDarkMode = params[1] || false;

        if (!colorPaletteTitle) return;

        var label = "Switch Palette";
        var tooltip = `switch to ${colorPaletteTitle}`;

        createTiddlyButton(place, label, tooltip, function () {
            var me = config.macros.switchColorPalette;
            var paletteTitle = me.getMainPaletteTitle();

            var sourceTiddler = store.getTiddler(colorPaletteTitle);
            if (!sourceTiddler) return;

            var targetTiddler = new Tiddler(paletteTitle);
            targetTiddler.text = sourceTiddler.text;
            targetTiddler.creator = sourceTiddler.creator;
            targetTiddler.modifier = sourceTiddler.modifier;
            targetTiddler.created = sourceTiddler.created;
            targetTiddler.modified = sourceTiddler.modified;
            targetTiddler.links = sourceTiddler.links;
            targetTiddler.linksUpdated = sourceTiddler.linksUpdated;
            targetTiddler.tags = sourceTiddler.tags;
            targetTiddler.fields = sourceTiddler.fields;

            store.saveTiddler(targetTiddler);

            me.applyAdjustments(isDarkMode);
            refreshColorPalette()
        });
    }
}
//}}}
/***
!!!FollowDarkMode
{{{
.darkMode {
    color-scheme: dark;
}
}}}
***/
