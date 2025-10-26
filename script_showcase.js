
document.addEventListener('DOMContentLoaded', ()=>{
  // Utility functions
  function uid(){return 'CIV-' + Math.random().toString(36).slice(2,9).toUpperCase();}
  function load(){return JSON.parse(localStorage.getItem('civic_complaints')||'[]');}
  function save(list){localStorage.setItem('civic_complaints', JSON.stringify(list));}
  function renderLists(){
    const list = load();
    const el = document.getElementById('complaintsList');
    const all = document.getElementById('allComplaints');
    if(el){ el.innerHTML = list.length ? list.map(c=>`<div class="grid-item" data-id="${c.id}" style="border-left:6px solid ${c.status==='Resolved'?'#10b981':c.status==='In Progress'?'#3b82f6':'#f59e0b'}"><div><div style="font-weight:800">${c.category} — ${c.id}</div><div class="small">${c.description}</div><div class="small" style="margin-top:8px">${c.location||'Location not provided'} • ${new Date(c.created).toLocaleString()}</div></div><div><div class="status ${c.status==='Pending'?'pending':c.status==='In Progress'?'progress':'resolved'}">${c.status}</div></div></div>`).join('') : '<div class="card">No complaints yet</div>' }
    if(all){ all.innerHTML = list.length ? list.map(c=>`<div class="grid-item" data-id="${c.id}" style="border-left:6px solid ${c.status==='Resolved'?'#10b981':c.status==='In Progress'?'#3b82f6':'#f59e0b'}"><div><div style="font-weight:800">${c.category} — ${c.id}</div><div class="small">${c.description}</div><div class="small" style="margin-top:8px">${c.location||'Location not provided'} • ${new Date(c.created).toLocaleString()}</div></div><div><div class="status ${c.status==='Pending'?'pending':c.status==='In Progress'?'progress':'resolved'}">${c.status}</div></div></div>`).join('') : '<div class="card">No complaints yet</div>' }
    // admin click handlers
    document.querySelectorAll('#allComplaints .grid-item').forEach(el=>el.addEventListener('click', ()=>{
      const id = el.getAttribute('data-id'); const arr = load(); const idx = arr.findIndex(x=>x.id===id); if(idx===-1) return;
      const order=['Pending','In Progress','Resolved']; const cur=arr[idx].status; arr[idx].status = order[(order.indexOf(cur)+1)%order.length]; save(arr); renderLists();
    }));
    // dashboard detail alert
    document.querySelectorAll('#complaintsList .grid-item').forEach(el=>el.addEventListener('click', ()=>{
      const id = el.getAttribute('data-id'); const arr = load(); const c = arr.find(x=>x.id===id); if(c) alert('Complaint ID: '+c.id+'\nCategory: '+c.category+'\nStatus: '+c.status+'\nDesc: '+c.description);
    }));
  }

  // Keep existing form functionality if present (report page)
  const reportForm = document.getElementById('reportForm');
  if(reportForm){
    const drop = document.getElementById('dropArea');
    const thumb = document.getElementById('thumb');
    const fileInput = document.getElementById('photo');
    const chips = document.querySelectorAll('.chip');
    const categoryInput = document.getElementById('categoryInput');
    // chips selection
    chips.forEach(ch=> ch.addEventListener('click', ()=>{ chips.forEach(c=>c.classList.remove('active')); ch.classList.add('active'); categoryInput.value = ch.dataset.value; }));
    // drag & drop
    if(drop){
      ['dragenter','dragover'].forEach(ev=> drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add('dragover'); }));
      ['dragleave','drop'].forEach(ev=> drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.remove('dragover'); }));
      drop.addEventListener('drop', e=>{ const f = e.dataTransfer.files[0]; if(f){ fileInput.files = e.dataTransfer.files; previewFile(f);} });
      fileInput.addEventListener('change', ()=>{ if(fileInput.files[0]) previewFile(fileInput.files[0]); });
    }
    function previewFile(file){ const reader = new FileReader(); reader.onload = e=> { thumb.innerHTML = '<img src="'+e.target.result+'" style="width:100%;height:100%;object-fit:cover;border-radius:8px" />'; }; reader.readAsDataURL(file); }
    // floating labels helper
    document.querySelectorAll('.input, textarea').forEach(inp=>{ inp.addEventListener('input', ()=>{ if(inp.value.trim().length) inp.classList.add('has-value'); else inp.classList.remove('has-value'); }); if(inp.value && inp.value.trim().length) inp.classList.add('has-value'); });
    reportForm.addEventListener('submit', e=>{ e.preventDefault(); const cat = document.getElementById('categoryInput').value || 'General'; const desc = document.getElementById('description').value.trim(); const loc = document.getElementById('location').value.trim() || 'Detected: Ward 12, Civil Lines'; if(!cat||!desc){ alert('Please select category and enter description'); return; } const arr = load(); const item = { id: uid(), category: cat, description: desc, location: loc, status: 'Pending', created: Date.now() }; arr.unshift(item); save(arr); // show modal if exists
      const modal = document.getElementById('successModal'); if(modal){ document.getElementById('modalText').innerText = 'ID: ' + item.id; modal.style.display = 'flex'; modal.addEventListener('click', ()=> modal.style.display='none'); } reportForm.reset(); document.querySelectorAll('.input').forEach(i=>i.classList.remove('has-value')); thumb.innerHTML='📷'; renderLists(); });
  }

  renderLists();

  // --- Chatbot implementation (CivicBot) ---
  const chatToggle = document.createElement('button'); chatToggle.className='chat-toggle'; chatToggle.title='CivicBot'; chatToggle.innerHTML = '<img src="assets/logo.png" style="width:26px;height:26px;border-radius:50%"/>';
  document.body.appendChild(chatToggle);

  const chatWindow = document.createElement('div'); chatWindow.className='chat-window'; chatWindow.style.display='none';
  chatWindow.innerHTML = `<div class="chat-header"><div style="width:36px;height:36px;border-radius:8px;overflow:hidden"><img src="assets/logo.png" style="width:100%;height:100%;object-fit:contain"/></div><div><strong>CivicBot</strong><div class="small">Your Civic assistant</div></div></div><div class="chat-body" id="chatBody"></div><div class="chat-input"><input id="chatInput" placeholder="Ask about complaint status or say hi..." /><button id="chatSend" class="btn primary">Send</button></div>`;
  document.body.appendChild(chatWindow);

  chatToggle.addEventListener('click', ()=>{ if(chatWindow.style.display==='none'){ chatWindow.style.display='flex'; document.getElementById('chatInput').focus(); } else chatWindow.style.display='none'; });

  function appendMessage(from, text){ const body = document.getElementById('chatBody'); const el = document.createElement('div'); el.style.padding='8px'; el.style.borderRadius='10px'; el.style.maxWidth='86%'; el.style.fontSize='14px'; el.style.lineHeight='1.3'; if(from==='bot'){ el.style.background='rgba(255,255,255,0.9)'; el.style.alignSelf='flex-start'; el.style.color='#07332b'; } else { el.style.background='linear-gradient(90deg,var(--accent),var(--accent-2))'; el.style.color='white'; el.style.alignSelf='flex-end'; } el.innerText = text; body.appendChild(el); body.scrollTop = body.scrollHeight; }

  function botReply(input){
    const text = input.toLowerCase();
    const complaints = load();
    // if user asks about an ID
    const idMatch = input.match(/CIV-[A-Z0-9]{5,}/i);
    if(idMatch){
      const id = idMatch[0].toUpperCase();
      const found = complaints.find(c=>c.id===id);
      if(found) return `Complaint ${found.id} is currently *${found.status}*. Description: ${found.description}`;
      else return `I couldn't find ${id} in our records. Are you sure the ID is correct?`;
    }
    if(text.includes('status') || text.includes('progress')){
      // return a random complaint status
      if(complaints.length===0) return 'There are no complaints in the demo yet. Try submitting one!';
      const sample = complaints[Math.floor(Math.random()*complaints.length)];
      return `Sample: Complaint ${sample.id} is *${sample.status}*.`;
    }
    if(text.includes('hi')||text.includes('hello')||text.includes('hey')) return 'Hey there! I can help you check complaint status. Try: "status of CIV-XXXXXX"';
    return "Thanks — I've noted that and will forward it to the city team. (Demo response)";
  }

  // send handler
  document.addEventListener('click', (e)=>{
    if(e.target && e.target.id==='chatSend'){
      const inputEl = document.getElementById('chatInput');
      const text = inputEl.value.trim(); if(!text) return;
      appendMessage('user', text); inputEl.value='';
      setTimeout(()=>{ appendMessage('bot', botReply(text)); }, 700);
    }
  });

  // allow Enter to send
  document.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && document.activeElement && document.activeElement.id==='chatInput'){ e.preventDefault(); document.getElementById('chatSend').click(); } });

});
