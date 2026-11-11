# دليل ربط المشروع بقاعدة بيانات سحابية (MongoDB Atlas) 🍃

يوضح هذا الدليل خطوة بخطوة كيفية إنشاء قاعدة بيانات سحابية مجانية 100% على **MongoDB Atlas**، والحصول على رابط الاتصال (Connection String)، وربطها بمشروع **TechStore**.

---

## 📋 الخطوات العملية بالترتيب

### الخطوة 1: إنشاء حساب مجاني على MongoDB Atlas
1. توجه إلى الموقع الرسمي: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. سجّل حساباً جديداً باستخدام بريدك الإلكتروني أو عبر حسابك في Google/GitHub.
3. أكمل خطوات الإعداد السريعة لاختيار نوع الحساب (Developer).

---

### الخطوة 2: إنشاء كلاستر مجاني (Free Shared Cluster M0)
1. بعد الدخول إلى لوحة التحكم، اضغط على زر **Create** أو **Build a Database**.
2. اختر الخطة المجانية تماماً: **M0 Free** (Shared Cluster).
3. اختر موفر الخدمة والمنطقة الأقرب لك (مثال: AWS - Frankfurt أو Ireland أو Paris).
4. اترك اسم الكلاستر الافتراضي `Cluster0` ثم اضغط على زر **Create Deployment** أو **Create Cluster**.

---

### الخطوة 3: إنشاء مستخدم لقاعدة البيانات (Database User)
ستظهر لك شاشة **Security Quickstart**:
1. اختر طريقة المصادقة: **Username and Password**.
2. أدخل اسم المستخدم (مثال: `techstore_admin`).
3. أدخل كلمة مرور قوية أو اضغط **Autogenerate Secure Password** (تأكد من نسخ كلمة المرور وحفظها في مفكرة!).
4. اضغط على **Create User**.

> 💡 **ملاحظة هامة:** تجنب استخدام رموز معقدة مثل `@` أو `:` داخل كلمة المرور، أو تأكد من استخدام حروف وأرقام فقط (مثل `TechStorePass2026`).

---

### الخطوة 4: السماح بالاتصال من أي عنوان IP (Network Access)
لتتمكن من الاتصال بقاعدة البيانات السحابية من جهازك أو من سيرفر الاستضافة دون حظر:
1. في نفس شاشة الإعداد، توجه إلى قسم **Where would you like to connect from?**.
2. اختر **My Local Environment**.
3. في خانة IP Address، اختر أو أضف: `0.0.0.0/0` (Allow Access from Anywhere).
4. اضغط على **Add Entry** ثم اضغط **Finish and Close** في أسفل الصفحة.

> 💡 يمكنك دائماً تعديل هذا الخيار لاحقاً من القائمة الجانبية: **Security** ➔ **Network Access** ➔ **Add IP Address** ➔ **Allow Access From Anywhere (`0.0.0.0/0`)**.

---

### الخطوة 5: الحصول على رابط الاتصال (Connection String)
1. في الصفحة الرئيسية (Overview)، اضغط على زر **Connect** الموجود بجانب اسم الكلاستر `Cluster0`.
2. اختر الخيار: **Drivers** (Node.js).
3. تأكد من تحديد Driver: **Node.js** والإصدار الأحدث (`5.5 or later`).
4. ستظهر لك جملة الاتصال بالشكل التالي:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
5. اضغط على أيقونة النسخ (Copy).

---

### الخطوة 6: تفعيل الرابط في مشروع TechStore
1. افتح ملف الإعدادات في المشروع:
   ```text
   d:\Downloads\nodeJsPj\techstore-app\backend\.env
   ```
2. استبدل سطر `MONGO_URI` بالرابط الذي نسخته، مع إدخال اسم المستخدم وكلمة المرور الخاصة بك واسم قاعدة البيانات `techstore_db`:

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=TECHSTORE_SUPER_SECRET_KEY_2026_XYZ

# رابط MongoDB Atlas السحابي:
MONGO_URI=mongodb+srv://techstore_admin:TechStorePass2026@cluster0.abcde.mongodb.net/techstore_db?retryWrites=true&w=majority
```

---

## ⚡ كيف تختبر نجاح الاتصال؟

قم بتشغيل السيرفر من موجه الأوامر:

```bash
cd d:\Downloads\nodeJsPj\techstore-app\backend
node server.js
```

عند نجاح الاتصال بـ Atlas، ستظهر لك الرسالة التالية في الطرفية:

```text
[MongoDB] Tentative de connexion au Cloud MongoDB Atlas...
====================================================
[MongoDB] Connexion établie avec succès !
[Base de données] : techstore_db
[Hôte / Source]   : Cloud Atlas Cluster
====================================================
[Seed] Insertion du catalogue de 12 produits dans MongoDB...
[Seed] 12 produits insérés dans MongoDB
```

> 🛡️ **ميزة الأمان الإضافية:** في حال حدث أي خطأ في اتصال السحاب (مثل نسيان كلمة المرور أو حظر الـ IP)، يقوم نظام TechStore تلقائياً بالتحويل الاحتياطي (Fallback) إلى MongoDB المحلي حتى لا يتوقف متجرك عن العمل!
