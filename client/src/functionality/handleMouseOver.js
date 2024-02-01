
export default function HandleMouseOver(id){
    let editable = document.getElementById(id)
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editable);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    editable.focus()
  }