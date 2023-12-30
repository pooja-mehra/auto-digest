import { useState } from "react";

export default function SimpleForm(){
    const [form,setForm] = useState(null||new Map())
    function handleChange(value) {
        setForm(value);
      }
    
      function handleSubmit(e) {
        e.preventDefault()
        alert('A name was submitted: ' + form.get('item'));
      }
    return (
        <form onSubmit={handleSubmit}>
          <label>
            ITEM:
            <input type="text" value={form != null ?form.get('item'):''} onChange={(e)=>{
                setForm(form.set('item',e.target.value))}} />
          </label>
          <label>
            QTY:
          <input type="number" min={1} value={form != null?form.get('qty'):1} onChange={(e)=>setForm(form.set('qty',e.target.value))} />
        </label>
          <input type="submit" value="Submit" />
        </form>
      );
}