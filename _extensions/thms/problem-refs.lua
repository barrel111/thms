-- Replace resolved local problem references after Quarto has numbered and linked
-- them. Collect every title first so forward references work too.
return {
  Pandoc = function(doc)
    if not quarto.doc.is_format("html") then return nil end
    local names = {}
    doc:walk({
      Div = function(div)
        if not div.identifier:match("^prb%-") then return nil end
        local name
        div:walk({
          traverse = "topdown",
          Div = function(child)
            -- An unnamed outer problem must not inherit a nested one's name.
            if child.identifier ~= div.identifier and child.classes:includes("problem") then
              return child, false
            end
          end,
          Span = function(span)
            if not name and span.classes:includes("thms-problem-name") and
                pandoc.utils.stringify(span) ~= "" then
              name = span:clone()
            end
          end
        })
        if name then
          -- A reference is already a link: retain formatted text and math,
          -- without copying nested links or duplicate inline identifiers.
          names[div.identifier] = name:walk({
            Link = function(link) return link.content end,
            Span = function(span)
              span.identifier = ""
              return span
            end
          })
        end
      end
    })
    return doc:walk({
      Link = function(link)
        if not link.classes:includes("quarto-xref") then return nil end
        local id = link.target:match("^#(prb%-.+)$")
        if id and names[id] then
          link.content = { names[id]:clone() }
          return link
        end
      end
    })
  end
}
