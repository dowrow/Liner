// Audio
// Sound collection player 
// Diego Castaño (Dowrow) 06-2014

// Requires howler
define(['howler.min'], function () {
    
    var click = new Howl({urls: ['samples/beep1.wav']}),
        clack = new Howl({urls: ['samples/beep2.wav']}),
        fail = new Howl({urls: ['samples/lasergun1.wav']});
        
    return {
        playClick: function () { click.play(); },
        playClack: function () { clack.play(); },
        playFail: function () { fail.play(); }
    };
});