-- Quarto renders theorem/proof content unchanged. Browser enhancement uses the
-- rendered title spans, rather than Quarto's private custom-node representation.
return {
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
