const dot=document.querySelector('.cursor-dot');
window.addEventListener('mousemove',e=>{if(dot){dot.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;}});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('is-visible')}),{threshold:.12});
document.querySelectorAll('section').forEach(s=>{s.classList.add('reveal');observer.observe(s)});
