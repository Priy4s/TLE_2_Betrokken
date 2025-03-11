import fs from 'fs';
import kNear from "./knear.js";

// run: node v1/training/train_model.js
// dit traint de ai en slaat hem op in v1/models/static_knn.json

// trainen van de classifiers
const knnClassifierStatic = new kNear(3);
// const knnClassifierMotion = new KNear(3);

// laad en train stilstaande tekens
const stillData = JSON.parse(fs.readFileSync('v1/training/still_sign_data.json'));
stillData.forEach(item => knnClassifierStatic.learn(item.points, item.label));

// // Laad en train bewegende tekens
// const motionData = JSON.parse(fs.readFileSync('v1/training_data/motion_sign_data.json'));
// motionData.forEach(item => knnClassifierMotion.learn(item.sequence.flat(), item.label));

// Sla de modellen op als JSON
fs.writeFileSync('v1/training/static_knn.json', JSON.stringify(knnClassifierStatic));
// fs.writeFileSync('v1/models/motion_knn.json', JSON.stringify(knnClassifierMotion));

console.log("✅ Model training voltooid en opgeslagen!");
