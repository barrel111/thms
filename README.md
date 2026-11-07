# thms for Quarto

> The current iteration relied heavily on AI assistance to rework and simplify an existing implementation, fix bugs, and improve accessibility and behavior.

Colored theorem environments and collapsible proofs and solutions for Quarto HTML documents. 
Requires Quarto 1.7.0 or later. 
PDF and Word output are not supported by this theme.

## Install

```sh
quarto add barrel111/thms
```

Commit the installed `_extensions` directory with your document source. 

## Use

Select the extension's HTML format in your document's YAML:

```yaml
format: thms-html
```

The format loads both the SCSS theme and the filter. 
Existing HTML options belong under the `thms-html` key (see the customization example below). 
If you override `theme`, include `thms.scss` from the installed extension directory in your theme list so the theorem styles are still compiled.

Write Quarto theorem environments and proofs as usual:

```markdown
::: {#thm-even-square}
The square of an even integer is even.
:::

::: {.proof key=even-square}
Write the integer as 2k. Its square is 2(2k²), which is even.
:::
```

## A Few Notes

This extension styles theorems, lemmas, corollaries, definitions, propositions, conjectures, remarks, examples, exercises, solutions, and problems.

Problems have free-form bodies. Use a `prb-` identifier for numbering and
cross-references, and an optional heading for the problem's name:

```markdown
::: {#prb-distinct-elements}
# Distinct Elements

Estimate the number of distinct elements in the stream.
:::

See @prb-distinct-elements.
```

The name appears in small caps with spaces replaced by hyphens
(“Distinct-Elements”); math and inline formatting are preserved.
References within the page, such as `@prb-distinct-elements`, display the problem's name with
the same small caps and hyphens. An unnamed problem uses its numbered label
(for example, “Problem 1”).
Use `::: {.problem}` for an unnumbered problem, with the same optional heading.
Problems remain visible and have no toggle control.

Proofs and solutions start collapsed after their controls initialize. 
Click the arrow or the “Proof” / “Solution” label to toggle it. The parenthesized title stays separate; clicking its links follows them without toggling the proof.
To start a proof/solution expanded, add `.expanded`:

```markdown
::: {.proof .expanded key=another-proof}
Proof text.
:::
```

Remarks always remain visible and have no toggle control.

Solutions also accept `.expanded`, for example `::: {#sol-answer .expanded}`.

The user can provide proofs with a `key` which must be unique within the page-- this allows us to store whether it has been expanded across multiple visits. 

Proof titles may contain links or cross-references too.

```markdown
::: {.proof key=even-square}
# For @thm-even-square
Write the integer as 2k. Its square is 2(2k²), which is even.
:::
```

You can modify the colors by adding a stylesheet through your document's YAML:

```yaml
format:
  thms-html:
    css: custom.css
```

Then override the CSS custom properties in `custom.css`:

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
`proposition`, `conjecture`, `remark`, `example`, `exercise`, `solution`, or `problem`.

## Example

[example.qmd](example.qmd) contains a short example of every environment,
including a proof that starts expanded, cross-references, and display equations.

[View the example screenshot](thms-example.png).

```sh
quarto preview example.qmd
```


