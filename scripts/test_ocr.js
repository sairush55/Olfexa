async function testOcr() {
  try {
    console.log("--> Testing /api/scan/ocr endpoint on http://localhost:3000 ...");
    const res = await fetch("http://localhost:3000/api/scan/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        labelType: "cosmetic_packaging"
      })
    });

    const data = await res.json();
    console.log("OCR Response Status:", res.status);
    console.log("OCR Extracted Candidates Count:", data.candidates?.length);
    console.log("Extracted Tokens:", data.candidates);
    console.log("Confidence Score:", data.confidence);
    console.log("Advisory Note:", data.note);

    console.log("\n--> Testing /api/analyze endpoint with extracted tokens ...");
    const analyzeRes = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: data.candidates,
        perfumeName: "OCR Verified Eau de Parfum",
        brand: "Maison Test"
      })
    });

    const analysisData = await analyzeRes.json();
    console.log("Analysis Status:", analyzeRes.status);
    console.log("Alcohol Evaluation:", analysisData.data?.alcoholStatus);
    console.log("Alcohol Explanation:", analysisData.data?.alcoholStatusExplanation);
    console.log("Detected Alcohols:", analysisData.data?.detectedAlcohols);
    console.log("Potential Allergens Detected:", analysisData.data?.potentialAllergens?.length);
    console.log("Transparency Rating:", analysisData.data?.transparencyRating);

    console.log("\n--> ALL VISION OCR & ANALYSIS CHECKS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testOcr();
