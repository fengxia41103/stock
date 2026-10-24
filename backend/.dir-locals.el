;;; Directory Local Variables for stock/backend
;;; Python tooling for this repo: ruff (pyproject [tool.ruff], line 100),
;;; plus flake8 (.flake8, max-line 88) and isort (.isort.cfg, line 88).
;;;
;;; - apheleia formats on save with ruff (reads pyproject.toml here).
;;; - flycheck lints with flake8 to match the repo's .flake8 (its stricter
;;;   88-col limit is what this project enforces).
;;; The tools themselves read the repo config files, so line-length,
;;; import style, etc. are honored automatically.

((python-mode
  . ((apheleia-formatter . (ruff-isort ruff-format))
     (flycheck-checker . python-flake8))))
