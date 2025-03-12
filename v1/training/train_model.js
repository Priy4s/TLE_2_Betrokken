import fs from 'fs';
import kNear from "./knear.js";

// Run: node v1/training/train_model.js

const knnClassifierStatic = new kNear(3);
// const knnClassifierMotion = new KNear(3);


const stillData = JSON.parse(fs.readFileSync('v1/training/still_sign_data.json'));
stillData.forEach(item => knnClassifierStatic.learn(item.points, item.label));

// For motion signs
// const motionData = JSON.parse(fs.readFileSync('v1/training_data/motion_sign_data.json'));
// motionData.forEach(item => knnClassifierMotion.learn(item.sequence.flat(), item.label));

fs.writeFileSync('v1/training/static_knn.json', JSON.stringify(knnClassifierStatic));
// fs.writeFileSync('v1/models/motion_knn.json', JSON.stringify(knnClassifierMotion));

console.log("✅ Model training voltooid en opgeslagen!");
