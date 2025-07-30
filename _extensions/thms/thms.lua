local function better_thm(el)
  local prefix_node = pandoc.LineBreak()
  local paragraphs = el["__quarto_custom_node"].content[1].content[1].content
  table.insert(paragraphs[1].content, 1, prefix_node)
  return el
end

local function better_proof(el)
  local prefix_node = pandoc.Para({
  })
  print(el)
  local paragraphs = el["__quarto_custom_node"].content[1].content[1].content
  table.insert(paragraphs, 1, prefix_node)
  return el
end

local function pcall_el(el, func)
  local func_ret, err = pcall(func, el)
  if err then
    return el
  end
  return func_ret
end

-- Run in two passes so we process metadata
-- and then process the divs
return {
  {
    Meta = function(meta)
      -- Files are relative to the extension directory
      quarto.doc.add_html_dependency({
        name = "thms",
        version = "1.0.0",
        stylesheets = { "thms.scss" },
        scripts = { "thms.js" }
      })
      return meta
    end
  },
  {
    Theorem = function(el) return pcall_el(el, better_thm) end,
    Proof = function(el) return pcall_el(el, better_proof) end
  }
}
