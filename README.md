# Андрей Краишкин — HR-директор / CHRO

Интерактивный лендинг-резюме: пять вариантов оформления, русская и английская версии, печатное резюме в PDF. Без сборки, фреймворков и внешних запросов — чистые HTML, CSS и JS.

## Как посмотреть

Откройте `index.html` двойным кликом или поднимите локальный сервер:

```powershell
python -m http.server 8080
```

- `http://localhost:8080/?theme=signal` — тёмная executive-tech версия (по умолчанию)
- `http://localhost:8080/?theme=template` — версия вашего PPTX-шаблона
- `http://localhost:8080/?theme=onyx` — графит + медь, спокойная тёмная версия
- `http://localhost:8080/?theme=onyx-steel` — графит + сталь-синий
- `http://localhost:8080/?theme=onyx-bordeaux` — графит + бордо
- `http://localhost:8080/?lang=en` — английская версия
- `resume.html` — печатная версия A4, кнопка «Сохранить PDF»

## Что где менять

- Текст, цифры, контакты — только `assets/content.js` (RU и EN рядом).
- Цвета, шрифты, сетки — `assets/styles/base.css` и пять файлов тем.
- Печатное резюме — `resume.html` + `assets/styles/resume.css`.
- Правила проекта и канон фактов — `AGENTS.md`.

После правки контента проверьте обе языковые версии и `resume.html`.

## Деплой на GitHub Pages

1. Создайте публичный репозиторий **`kraishkinaa.github.io`**.
2. В папке проекта уже есть git-репозиторий и первый коммит. Осталось подключить remote:

```powershell
cd C:\Users\Пользователь\OneDrive\Desktop\OpenCode\MyResume
git remote add origin https://github.com/kraishkinaa/kraishkinaa.github.io.git
git push -u origin main
```

3. GitHub → **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, folder: **/ (root)**.
4. Через 1–2 минуты сайт откроется по адресу `https://kraishkinaa.github.io`.

Если имя `kraishkinaa.github.io` занято, назовите репозиторий `resume` — сайт будет по адресу `https://kraishkinaa.github.io/resume/`.

OG-теги и canonical уже настроены на `https://kraishkinaa.github.io/`.

## Перед публикацией

- Убрать плавающий переключатель вариантов: в `assets/app.js` поставить `SHOW_THEME_SWITCH = false`.
- Выбрать тему по умолчанию: класс `theme-*` на `<body>` в `index.html` и значение по умолчанию в `app.js`.
- Проверить, что в тексте нет чувствительных кейсов и упоминаний, перечисленных в `AGENTS.md`.
- Проверить `resume.html`: печать должна укладываться в три страницы A4.

## Структура

```
index.html            лендинг
resume.html           печатная версия
assets/content.js     весь текст RU/EN
assets/app.js         язык, темы, счётчики, табы
assets/styles/        base + пять тем + resume
assets/fonts/         Unbounded, Manrope, Playfair Display
assets/img/           фото, OG-картинка, favicon
```
