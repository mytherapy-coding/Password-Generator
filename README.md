# Password-Generator
A simple and customizable password generator that creates secure random passwords.

# 🔐 Password Generator

A clean, modern, customizable password generator built with HTML, CSS, and JavaScript.  
It allows users to generate secure passwords with adjustable length, character sets, custom symbols, and an optional iCloud‑style preset.

This project includes real‑time validation, entropy‑based strength calculation, and a polished UI that follows the original project design guidelines.

---

## ✨ Features

- Adjustable password length (4–64)
- Choose character types:
  - Lowercase (a–z)
  - Uppercase (A–Z)
  - Numbers (0–9)
  - Symbols (customizable)
- Custom symbol input with validation
- iCloud‑style preset mode (Apple‑like password format)
- Password strength meter (entropy‑based)
- Copy‑to‑clipboard button
- Clear button to reset the UI
- Real‑time validation and disabled Generate button when inputs are invalid
- Clean, modern UI with smooth interactions

---

## 🧠 Password Strength

Strength is calculated using entropy:

entropy = length × log2(poolSize)


Strength levels:
- **Weak**: under 45 bits  
- **Medium**: 45–70 bits  
- **Strong**: 70+ bits  

---

## 📦 Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Crypto API** for secure random generation

---

## 🚀 How to Use

1. Choose your desired password length.
2. Select the character types you want to include.
3. (Optional) Enter custom symbols if the Symbols option is enabled.
4. (Optional) Enable the iCloud preset for an Apple‑style password.
5. Click **Generate** to create a password.
6. Click **Copy** to copy it to your clipboard.
7. Click **Clear** to reset the interface.

---

## 🖼️ Screenshot

*(Add a screenshot of your app here once deployed)*

---

## 🌐 Live Demo

Once published with GitHub Pages, your live link will go here:


https://mytherapy-coding.github.io/Password-Generator/

---

## 📄 License

This project is open‑source and available under the MIT License.
