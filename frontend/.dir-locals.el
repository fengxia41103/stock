;;; Directory Local Variables for stock/frontend
;;; JS/TS/CSS formatting via prettier, reading this folder's
;;; .prettierrc.json (printWidth 80, import ordering). apheleia uses the
;;; project-local node_modules/.bin/prettier automatically.

((js2-mode   . ((apheleia-formatter . prettier)))
 (js-mode    . ((apheleia-formatter . prettier)))
 (typescript-mode . ((apheleia-formatter . prettier)))
 (json-mode  . ((apheleia-formatter . prettier)))
 (css-mode   . ((apheleia-formatter . prettier)))
 (scss-mode  . ((apheleia-formatter . prettier)))
 (web-mode   . ((apheleia-formatter . prettier))))
