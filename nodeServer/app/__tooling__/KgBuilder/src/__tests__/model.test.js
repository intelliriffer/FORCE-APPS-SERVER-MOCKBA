let model = require('../model').MODEL;
let PRIVATES = require('../model').PRIVATE

test("getPitch returns F0 23 cents", () => {
    let pitch = PRIVATES.getPitch(2048, 44100);
    expect(pitch.ROOT).toBe(29); //F0; expect(pitch.CENTS).toBe(23);
});

test("isWaveNamed should return true for string ending with .wav or .WAV", () => {
    expect(PRIVATES.isWavNamed("somefile.wav")).toBe(true);
    expect(PRIVATES.isWavNamed("somefile.WAV")).toBe(true);
    expect(PRIVATES.isWavNamed("somefile.WAVE")).toBe(false);
});

test("getNoteNumber should Return Note Number Embedded in File End", () => {
    let file1 = "mysample 36.wav";
    let file2 = "mysample-48.wav";
    let file3 = "mysample-F0.wav";
    let file4 = "mysample-C3.wav";
    expect(PRIVATES.getNoteNumber(file1, '')).toBe(36);
    expect(PRIVATES.getNoteNumber(file2, '')).toBe(48);
    expect(PRIVATES.getNoteNumber(file3, '')).toBe(29);
    expect(PRIVATES.getNoteNumber(file4, '')).toBe(60);
});

test("BUZZFIX should return Correct Sample Count", () => {
    model.OPTIONS.BUZZFIX = true;
    expect(PRIVATES.Samples(10)).toBe(10);
    model.OPTIONS.BUZZFIX = false;
    expect(PRIVATES.Samples(10)).toBe(9);

});