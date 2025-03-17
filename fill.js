import Sign from "./v1/models/Sign.js";
import FacialExpression from "./v1/models/FacialExpression.js";
import User from "./v1/models/User.js";
import Key from "./v1/models/Key.js";

try {
    //Add standard facial expressions to database
    const facialExpressions = ['blij', 'boos', 'geen', 'vragend zonder mond', 'vragend met mond'];

    for (const facialExpression of facialExpressions) {

        //Prevent duplicate records by checking if one already exists
        const expressionRecord = await FacialExpression.findOne({
            where: {
                name: facialExpression,
                image_path: `${facialExpression.replace(/\s/g, '-')}.png`
            }
        })

        if (expressionRecord) {
            continue;
        }

        const newExpression = FacialExpression.build({
            name: facialExpression,
            image_path: `${facialExpression.replace(/\s/g, '-')}.png`
        });

        await newExpression.save();

    }

    console.log('Successfully added facial expressions to database')

} catch (error) {
    console.log({error: error.message})
}

const [user, created] = await User.findOrCreate({
    where: {code: 'Administrator'},
    defaults: {
        code: 'Administrator',
        name: 'Admin',
        role: 42,
    },
});

//Give the admin a semi-permanent key
if (user) {

    const key = await Key.create({
        expires_at: 8000000000000000,
        user_id: user.id
    });

    if (key) {
        console.log('key successfully generated for admin');
    } else {
        console.log('something went wrong when generating a key for the admin');
    }

}

if (created) {
    console.log('Successfully added Admin user');
} else if (user) {
    console.log('Admin user already exists');
} else {
    console.log('Admin user had not been created and does not exist');
}

try {
    await Sign.sync({force: true});

    const signs = {
        lesson: {
            1: {
                theme: {
                    "Vraagwoorden":
                        ["Algemeen vraag gebaar", "Hoe", "Hoelang", "Hoeveel", "Waarom", "Wanneer", "Wat", "Welke", "Wie", "Waar"],
                    "Tijdens de les":
                        ["Aanwezig", "Bedoeling", "Beginnen", "Boek", "Docent", "Student", "Huiswerk", "Klaar", "Koffie", "Les", "Lokaal", "Makkelijk", "Meenemen", "Moelijk", "Nu", "Oefening", "Ook", "Opdracht", "Pauze", "Thee", "Thuis", "Uitleggen", "Volgende", "Voorbeeld", "Voorbereiden", "Vorige", "WC"],
                    "Kennismaken":
                        ["Achternaam", "Voornaam", "Naam", "Voorstellen", "Welkom"],
                    "Begroeting":
                        ["Gaat het goed", "Goed", "Hallo", "OK", "Prima", "Tot ziens", "Goedemorgen", "Goedemiddag", "Goedeavond"]
                }
            },
            2: {
                theme: {
                    "Werkwoorden":
                        ["Antwoorden", "Doen", "Geven", "Hebben", "Helpen", "Kijken", "Kunnen", "Leren", "Lezen", "Vergeten", "Oefenen", "Onthouden", "Opruimen", "Vertellen", "Proberen", "Schrijven", "Willen", "Zeggen", "Zitten", "Vragen"],
                    "Luisterhouding":
                        ["Alsjeblieft (iets geven)", "Alsjeblieft (verzoek)", "Bedankt", "Ik begrijp het", "Ik begrijp het niet", "Jammer", "Klopt", "Klopt niet", "Leuk", "Opnieuw", "Sorry", "Spannend", "Vervelend", "Vreselijk"],
                    "Gevoelens":
                        ["Bang", "Blij", "Boos", "Opgelucht", "Verdrietig", "Zenuwachtig"],
                    "Tellen":
                        ["0 tot 12"]
                }
            },
            3: {
                theme: {
                    "Dagen & maanden overig" :
                        ["Ochtend", "Middag", "Avond", "Nacht", "Vanochtend", "Vanmiddag", "Vanavond", "Vannacht"],
                    "Maanden" :
                        ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
                    "Dagen" :
                        ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag", "Dag", "Maand", "Week", "Weekend", "Jaar"],
                }
            },
            5: {
                theme: {
                    "Alfabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
                }
            }
        }
    }

    for (const [lesson, lessonData] of Object.entries(signs.lesson)) {
        for (const [theme, signs] of Object.entries(lessonData.theme)) {
            for (const sign of signs) {
                let modelPath = "AI";

                if (theme === "Alfabet") {
                    const motionLetters = ["H", "J", "U", "X", "Z"];
                    modelPath = motionLetters.includes(sign) ? "Motion" : "Static";
                    console.log(sign)
                }

                const newSign = await Sign.create({
                    video_path: `${sign.replace(/\s/g, '-')}.mp4`,
                    definition: sign,
                    model_path: modelPath,
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
