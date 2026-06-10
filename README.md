# Self Care Pharmacy TikTok Video Maker

تطبيق بسيط جاهز للنشر على Netlify لإنتاج فيديوهات TikTok/Reels بنسبة 9:16 للصيدلية.

## المميزات

- فيديو 9:16 مناسب لتيك توك، ريلز، شورتس.
- رفع لوجو الصيدلية وصورة المنتج.
- سكريبت سريع بدون API.
- زر Gemini اختياري لتوليد Hook + Voiceover + Caption + Hashtags.
- تصدير فيديو WebM من المتصفح.
- تنبيه أمان لتجنب جرعات أو وعود علاجية.

## التشغيل المحلي

افتح `index.html` مباشرة للتجربة بدون Gemini.

لتجربة Gemini محليًا مع Netlify CLI:

```bash
netlify dev
```

وأضف متغير البيئة:

```bash
GEMINI_API_KEY=ضع_المفتاح_هنا
```

## النشر على Netlify

1. ارفع المجلد كله على Netlify.
2. افتح Site settings.
3. افتح Environment variables.
4. أضف:

```text
GEMINI_API_KEY=your_api_key_here
```

5. اعمل Deploy جديد.

## ملاحظات مهمة

- لا تضع مفتاح Gemini داخل `index.html`.
- التصدير من المتصفح يعتمد على دعم الجهاز لـ MediaRecorder.
- لو عايز MP4، حوّل ملف WebM باستخدام CapCut أو أي محوّل فيديو.
