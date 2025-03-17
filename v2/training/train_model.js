import fs from 'fs';
import kNear from "./knear.js";

// Run: node v2/training/train_model.js

const knnClassifierStatic = new kNear(3);
const knnClassifierMotion = new kNear(3);

const stillData = JSON.parse(fs.readFileSync('v2/training/still_sign_data.json'));
stillData.forEach(item => knnClassifierStatic.learn(item.points, item.label));

const motionData = JSON.parse(fs.readFileSync('v2/training/motion_sign_data.json'));
motionData.forEach(item => {
    if (item.sequence && item.label) {
        const flattenedSequence = item.sequence.flat();
        knnClassifierMotion.learn(flattenedSequence, item.label);
    } else {
        console.log(`Skipping invalid motion data:`, item);
    }
});

// Save trained models
fs.writeFileSync('v2/training/static_knn.json', JSON.stringify(knnClassifierStatic));
fs.writeFileSync('v2/training/motion_knn.json', JSON.stringify(knnClassifierMotion));

console.log("✅ Model training voltooid en opgeslagen!");
