# thms for Quarto

Colored theorem environments and collapsible proofs and solutions for Quarto
HTML documents. Requires Quarto 1.7.0 or later. PDF and Word output are not
supported by this theme.

## Install

```sh
quarto add barrel111/thms
```

Commit the installed `_extensions` directory with your document source. The
extension ships SCSS and JavaScript. Quarto compiles the SCSS into CSS during
rendering; no separate Sass installation or asset build is required.

## Use

Select the extension's HTML format in your document's YAML:

```yaml
format: thms-html
```

The format loads both the SCSS theme and the filter. When upgrading from the
filter-only setup, replace `format: html` with `format: thms-html` and remove
`thms` from `filters` to avoid loading it twice. Existing HTML options belong
under the `thms-html` key (see the customization example below). If you override
`theme`, include `thms.scss` from the installed extension directory in your
theme list so the theorem styles are still compiled.

Write Quarto theorem environments and proofs as usual:

```markdown
::: {#thm-even-square}
The square of an even integer is even.
:::

::: {.proof key=even-square}
Write the integer as 2k. Its square is 2(2k²), which is even.
:::
```

Quarto supplies the numbering and cross-references. This extension styles
theorems, lemmas, corollaries, definitions, propositions, conjectures, remarks,
examples, exercises, and solutions. Remarks always remain visible and have no
toggle control.

## Expansion and saved state

Proofs and solutions start collapsed after their controls initialize. Click a
heading or focus its button and press Enter or Space to toggle it. To start a
proof open, add `.expanded`:

```markdown
::: {.proof .expanded key=another-proof}
Proof text.
:::
```

Solutions also accept `.expanded`, for example `::: {#sol-answer .expanded}`.
A saved choice takes precedence over this default.

Give each proof a stable `key` that is unique within the page. The extension
uses that key, or the environment's HTML ID if no key is supplied. Numbered
solutions already have an ID such as `sol-answer`. Without either, toggling
still works but the choice is not saved.

Choices are stored in the browser's `localStorage`, separately for each page
pathname and origin. They do not sync across devices; moving a page to a new
path starts fresh. This version replaces the previous shared storage key, so
previously saved expansion choices reset on upgrade.

Unavailable storage or invalid saved data does not prevent toggling. Without
JavaScript, content stays visible. Printing includes every proof and solution,
regardless of its screen state.

## Customize colors

Add a stylesheet through your document's YAML:

```yaml
format:
  thms-html:
    css: custom.css
```

Override the environment variables in `custom.css`:

```css
:root {
  --thms-theorem-border: #245a81;
  --thms-theorem-bg: #edf5fb;
  --thms-solution-border: #2a7f7f;
  --thms-solution-bg: #edf5f5;
}
```

Each styled environment has `--thms-<type>-border` and `--thms-<type>-bg`
variables, where `<type>` is `theorem`, `lemma`, `corollary`, `definition`,
`proposition`, `conjecture`, `remark`, `example`, `exercise`, or `solution`.

## Example

[example.qmd](example.qmd) contains a short example of every environment,
including a proof that starts expanded, cross-references, display equations,
and a solution containing a list.

```sh
quarto preview example.qmd
```
