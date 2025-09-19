// Animated background with simple physics (fall + collisions)
(function(){
	let running = false;
	let hostEl = null;
		let rafId = 0;
		let spawnTimer = 0;
	const IMG_SRC = 'img/SoldifySymbol.png';
	const bodies = [];
	let width = 0, height = 0;

			const CFG = {
				maxConcurrent: 14,
		sizeMin: 24,
		sizeMax: 120,
				gravity: 440,     // px/s^2 (mais lento)
		air: 0.02,        // damping
		restitution: 0.3, // colisão inelástica
			drift: 8,         // leve empurrão horizontal (mais lento)
				timeScale: 0.48,  // escala de tempo para desacelerar tudo
				spawnRateMin: 0.55, // segundos entre spawns (mín)
				spawnRateMax: 1.6   // segundos entre spawns (máx)
	};

	function rand(min, max){ return Math.random() * (max - min) + min; }

		function createBody(seed=false){
		const size = rand(CFG.sizeMin, CFG.sizeMax);
		const r = size/2;
		const x = rand(r, width - r);
			const y = seed ? rand(-60, 80) : rand(-height * 0.5, r);
		const vx = rand(-CFG.drift, CFG.drift);
		const vy = rand(20, 80);
		const angle = rand(0, 360);
		const omega = rand(-40, 40);

		const el = document.createElement('img');
		el.src = IMG_SRC;
		el.alt = '';
		el.className = 'symbol';
		el.style.width = size + 'px';
		el.style.height = size + 'px';
		el.style.left = '0px';
		el.style.top = '0px';
		el.style.position = 'absolute';
		el.style.animation = 'none';
		hostEl.appendChild(el);

		return { el, x, y, vx, vy, r, size, angle, omega };
	}

			function ensureMax(n){
			while (bodies.length > n) {
				const b = bodies.pop();
				if (b && b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
			}
		}

		function scheduleNextSpawn(){
			spawnTimer = rand(CFG.spawnRateMin, CFG.spawnRateMax);
		}

	function handleCollisions(dt){
		const n = bodies.length;
		for (let i=0;i<n;i++){
			const a = bodies[i];
			for (let j=i+1;j<n;j++){
				const b = bodies[j];
				let dx = b.x - a.x; let dy = b.y - a.y;
				let dist = Math.hypot(dx, dy) || 0.0001;
				const minDist = (a.r + b.r) * 0.96;
				if (dist < minDist){
					// normal unit
					const nx = dx / dist; const ny = dy / dist;
					// Separate overlap
					const overlap = (minDist - dist) * 0.5;
					a.x -= nx * overlap; a.y -= ny * overlap;
					b.x += nx * overlap; b.y += ny * overlap;
					// Relative velocity
					const rvx = b.vx - a.vx; const rvy = b.vy - a.vy;
					const velAlongNormal = rvx*nx + rvy*ny;
					if (velAlongNormal < 0){
						const e = CFG.restitution;
						const jimp = -(1+e) * velAlongNormal / 2; // m1=m2
						const ix = jimp * nx; const iy = jimp * ny;
						a.vx -= ix; a.vy -= iy;
						b.vx += ix; b.vy += iy;
					}
				}
			}
		}
	}

	function wrapOrRespawn(b){
		// floor: respawn on top
		if (b.y - b.r > height + 20){
			b.y = -b.size - rand(20, 200);
			b.x = rand(b.r, width - b.r);
			b.vy = rand(30, 120);
			b.vx = rand(-CFG.drift, CFG.drift);
			b.angle = rand(0, 360);
			b.omega = rand(-60, 60);
		}
		// walls: wrap horizontally
		if (b.x < -b.r) b.x = width + b.r;
		if (b.x > width + b.r) b.x = -b.r;
	}

	let last = 0;
		function tick(ts){
		if (!running) return;
		rafId = requestAnimationFrame(tick);
				if (!last) last = ts; const dt = Math.min(0.034, (ts - last)/1000); last = ts;
			const sdt = dt * CFG.timeScale;

				// Spawning contínuo aleatório
					spawnTimer -= sdt;
				if (spawnTimer <= 0 && bodies.length < CFG.maxConcurrent){
						bodies.push(createBody());
					scheduleNextSpawn();
				}
				ensureMax(CFG.maxConcurrent);

		// Integrate
			for (const b of bodies){
			// forces
				b.vy += CFG.gravity * sdt;
				b.vx *= (1 - CFG.air*sdt*60);
				b.vy *= (1 - CFG.air*sdt*60);
			// integrate
				b.x += b.vx * sdt;
				b.y += b.vy * sdt;
				b.angle += b.omega * sdt;
			wrapOrRespawn(b);
		}

		// Collisions
		handleCollisions(dt);

		// Render
		for (const b of bodies){
			b.el.style.transform = `translate(${(b.x - b.r).toFixed(2)}px, ${(b.y - b.r).toFixed(2)}px) rotate(${b.angle.toFixed(2)}deg)`;
		}
	}

	function start(){
		if (running) return;
		running = true;
		width = window.innerWidth; height = window.innerHeight;
		if (!hostEl) {
			hostEl = document.createElement('div');
			hostEl.className = 'login-bg';
			document.body.appendChild(hostEl);
		}
			// seed inicial para visual imediato, sem encher tudo de uma vez
			const seedCount = Math.min(5, CFG.maxConcurrent);
			for (let i=0;i<seedCount;i++) bodies.push(createBody(true));
			// agendar primeiro spawn rapidamente
			spawnTimer = rand(0.1, 0.5);
		last = 0;
		rafId = requestAnimationFrame(tick);
		window.addEventListener('resize', onResize);
	}

	function stop(){
		running = false;
		cancelAnimationFrame(rafId);
		window.removeEventListener('resize', onResize);
		while (bodies.length){
			const b = bodies.pop();
			if (b && b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
		}
		if (hostEl && hostEl.parentNode) {
			hostEl.parentNode.removeChild(hostEl);
			hostEl = null;
		}
	}

	function onResize(){
		width = window.innerWidth; height = window.innerHeight;
	}

	window.LoginBg = { start, stop };
})();
