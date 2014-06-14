// Requires pages.js to adapt canvas to screen
require(['liner', 'pages.min'], function(Liner) {
    Liner.bindCanvas('screen');
    Liner.start();
});
