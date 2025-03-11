import Sign from "./v1/models/Sign.js";

try {
    await Sign.sync({force: true});

    // const signs = [{
    //     video_path: "-",
    //     definition: "Algemeen Vraaggebaar",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Hoe",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Hoelang",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Hoeveel",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Waarom",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Wanneer",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Wat",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Welke",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Wie",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }, {
    //     video_path: "-",
    //     definition: "Waar",
    //     model_path: "-",
    //     lesson: 1,
    //     theme: "Vraagwoorden"
    // }];

    const signs = {
        lesson: {
            1: {
                theme: {
                    "Vraagwoorden": ["Algemeen vraaggebaar", "Hoe", "Hoelang", "Hoeveel", "Waarom", "Wanneer", "Wat", "Welke", "Wie", "Waar"],
                    "Tijdens de les": ["Aanwezig", "Bedoeling", "Beginnen", "Boek", "Docent", "Student", "Huiswerk", "Klaar 2x", "Koffie", "Les", "Lokaal", "Makkelijk", "Meenemen", "Moelijk", "Nu", "Oefening", "Ook", "Opdracht", "Pauze", "Thee", "Thuis", "Uitleggen", "Volgende", "Voorbeeld", "Voorbereiden", "Vorige", "WC"],

                }
            },
            5: {
                theme: {
                    "Alfabet": ["A", "B", "C", "D", "E","F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
                }
            }
        }
    }

    for (const [lesson, lessonData] of Object.entries(signs.lesson)) {
        for(const [theme, signs] of Object.entries(lessonData.theme)) {
            for(const sign of signs) {
                const newSign = Sign.create({
                    video_path: `/videos/${sign}.mp4`,
                    definition: sign,
                    model_path: "AI",
                    lesson: lesson,
                    theme: theme
                });
            }
        }
    }
    console.log("Database succesvol gevuld!")
} catch {
    console.log("Fout bij het vullen van de database.")
}
