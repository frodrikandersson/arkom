# AI Detection System Limitations

## Overview
Arkom's AI detection system uses a multi-layered approach combining metadata analysis, visual AI detection (Illuminarty), behavioral tracking, and community signals. However, there are known limitations.

## Known Limitations

### 1. False Positives on Polished Digital Art
**Issue:** Professional digital artists using tools like Photoshop, Procreate, or Krita may be flagged as AI-generated.

**Why:** AI detection models struggle to distinguish between:
- Clean digital brushwork vs AI-generated smoothness
- Professional composition vs AI's learned patterns
- Polished gradients vs AI rendering

**Test Results:** 50% false positive rate on human digital art (3/6 test images)

**Affected Artworks:**
- Smooth, polished digital paintings
- Highly rendered illustrations
- Professional-quality digital art with clean lines

### 2. Modern Phone Photography
**Issue:** Photos taken on modern smartphones can score 50/50 (uncertain) due to heavy computational photography processing.

**Why:** Modern phones apply AI-powered processing:
- HDR merging
- Noise reduction
- Scene optimization
- Portrait mode effects

### 3. Metadata Stripping
**Issue:** Many platforms (Discord, Twitter, Instagram) strip metadata when images are uploaded/downloaded.

**Result:** Legitimate art loses provenance indicators, lowering scores by 10-15 points.

### 4. No Single Layer is Definitive
**Issue:** Visual AI detection alone has ~50% false positive rate.

**Solution:** Multi-layered approach with:
- Metadata (10% weight)
- Visual AI (30% weight)
- File Analysis (20% weight)
- Behavioral (25% weight)
- Community (15% weight)

## Mitigation Strategies

### For Artists:
1. **Keep original files** with intact metadata
2. **Build reputation over time** through consistent uploads
3. **Use the appeals process** if falsely flagged
4. **Get verified** for score boost

### For Platform:
1. **Appeals system** for false positives
2. **Artist verification program** with portfolio review
3. **Behavioral tracking** to identify upload patterns
4. **Community reporting** with reputation system
5. **30-day caching** to avoid re-analysis costs

## Accuracy Metrics (Phase 1+2 Testing)

| Metric | Result |
|--------|---------|
| True Positives (AI detected as AI) | 100% (1/1) |
| True Negatives (Human detected as human) | 50% (3/6) |
| False Positives (Human detected as AI) | 50% (3/6) |
| False Negatives (AI detected as human) | 0% (0/1) |

**Conclusion:** System errs on the side of caution (false positives) rather than allowing AI art through (false negatives).

## Legal Framing

All detection results use language like:
- "Indicators suggest..."
- "Likely AI-generated"
- "Confidence: medium/high"
- "Cannot guarantee authenticity"

This protects against liability while still providing value to the community.

## Future Improvements

1. **Phase 3 Implementation:** Behavioral + Community signals
2. **Ensemble Detection:** Multiple AI detection services
3. **User Education:** Help artists understand what triggers flags
4. **Transparent Scoring:** Show users exactly why they got their score
