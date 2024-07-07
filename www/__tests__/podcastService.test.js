jest.mock("openai", () => ({
    OpenAI: jest.fn(() => ({})),
}));
jest.mock("elevenlabs", () => ({
    ElevenLabsClient: jest.fn(() => ({})),
}));

const { convertToObjects } = require("../services/podcastService");

describe("convertToObjects", () => {
    it("should convert text to an array of objects with role and text properties", () => {
        const inputText =
            "Host: Welcome to the show!\nGuest: Thank you for having me.\nHost: How did you start in this field?\nGuest: It all began when I was a child.";

        const expectedOutput = [
            { role: "Host", text: "Welcome to the show!" },
            { role: "Guest", text: "Thank you for having me." },
            { role: "Host", text: "How did you start in this field?" },
            { role: "Guest", text: "It all began when I was a child." },
        ];

        const result = convertToObjects(inputText);
        console.log("the first result is equal: ", result);
        expect(result).toEqual(expectedOutput);
    });

    it("should handle lines without colons gracefully", () => {
        const inputText = "Host: Welcome to the show!\nThis line has no colon\nGuest: Thank you for having me.";

        const expectedOutput = [
            { role: "Host", text: "Welcome to the show!" },
            { role: "Guest", text: "Thank you for having me." },
        ];

        const result = convertToObjects(inputText);
        expect(result).toEqual(expectedOutput);
    });

    it("should handle empty input gracefully", () => {
        const inputText = ``;

        const expectedOutput = [];

        const result = convertToObjects(inputText);
        expect(result).toEqual(expectedOutput);
    });
});
