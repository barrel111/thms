-- Existing theorem/proof content passes through unchanged. Problems use Quarto's
-- public custom-cross-reference support, with the same heading syntax as theorems.
local function problem(div)
  if not quarto.doc.is_format("html") then return nil end
  local numbered = div.identifier:match("^prb%-") ~= nil
  if not numbered and not div.classes:includes("problem") then return nil end
  if not div.classes:includes("problem") then div.classes:insert("problem") end

  local title = pandoc.Inlines({})
  if div.content[1] and div.content[1].t == "Header" then
    title = div.content:remove(1).content
  end
  local name = pandoc.Span(title, pandoc.Attr("", { "thms-problem-name" }))
  name = name:walk({
    Space = function() return pandoc.Str("-") end,
    SoftBreak = function() return pandoc.Str("-") end
  })

  if numbered then
    -- Quarto consumes the last paragraph as the float caption. Appending it
    -- explicitly keeps every body paragraph, including a paragraph-only body.
    if #div.content == 0 then div.content:insert(pandoc.Plain({})) end
    div.content:insert(pandoc.Para(#title > 0 and { name } or {}))
  else
    local heading = pandoc.Inlines({ pandoc.Str("Problem") })
    if #title > 0 then
      heading:extend({ pandoc.Space(), pandoc.Str("("), name, pandoc.Str(")") })
    end
    heading:insert(pandoc.Str("."))
    div.content:insert(1, pandoc.Para({
      pandoc.Span({ pandoc.Strong(heading) }, pandoc.Attr("", { "thms-problem-title" }))
    }))
  end
  return div
end

return {
  Div = problem,
  Meta = function(meta)
    if quarto.doc.is_format("html") then
      quarto.doc.add_html_dependency({
        name = "thms",
        version = "1.1.0",
        scripts = { "thms.js" }
      })
    end
    return meta
  end
}
