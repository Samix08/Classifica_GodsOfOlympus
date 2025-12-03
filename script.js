        // Sistema di punteggio
        const pointsSystem = {
            1: 10000,
            2: 7500,
            3: 5000,
            4: 3000,
            5: 3000
        };

        // Carica dati dal localStorage all'avvio
        function loadData() {
            const saved = localStorage.getItem('eventRankings');
            if (saved) {
                eventRankings = JSON.parse(saved);
            }
        }

        // Salva dati nel localStorage
        function saveData() {
            localStorage.setItem('eventRankings', JSON.stringify(eventRankings));
        }

        // Aggiungi nuovo Sfida
        function addEvent() {
            const eventName = document.getElementById('eventName').value || `Sfida ${eventRankings.length + 1}`;
            const players = [
                document.getElementById('player1').value.trim(),
                document.getElementById('player2').value.trim(),
                document.getElementById('player3').value.trim(),
                document.getElementById('player4').value.trim(),
                document.getElementById('player5').value.trim()
            ];

            // Verifica che almeno il primo posto sia inserito
            if (!players[0]) {
                alert('Inserisci almeno il nome del 1° classificato!');
                return;
            }

            // Filtra i giocatori vuoti
            const validPlayers = players.filter(p => p !== '');

            const newEvent = {
                event: eventRankings.length + 1,
                name: eventName,
                rankings: validPlayers
            };

            eventRankings.push(newEvent);
            saveData();
            clearForm();
            updateDisplay();
            alert('✅ Sfida aggiunta con successo!');
        }

        // Pulisci il form
        function clearForm() {
            document.getElementById('eventName').value = '';
            for (let i = 1; i <= 5; i++) {
                document.getElementById(`player${i}`).value = '';
            }
        }

        // Elimina sfida
        function deleteEvent(index) {
            if (confirm('Sei sicuro di voler eliminare questa sfida?')) {
                eventRankings.splice(index, 1);
                // Riordina i numeri delle sfide
                eventRankings.forEach((event, idx) => {
                    event.event = idx + 1;
                });
                saveData();
                updateDisplay();
            }
        }

        // Calcola gemme totali
        function calculateTotalPoints() {
            const playerStats = {};

            eventRankings.forEach((event, eventIndex) => {
                event.rankings.forEach((player, position) => {
                    if (!playerStats[player]) {
                        playerStats[player] = {
                            name: player,
                            totalPoints: 0,
                            eventsParticipated: 0,
                            eventDetails: []
                        };
                    }

                    const points = pointsSystem[position + 1] || 0;
                    playerStats[player].totalPoints += points;
                    playerStats[player].eventsParticipated++;
                    playerStats[player].eventDetails.push({
                        event: eventIndex + 1,
                        eventName: event.name,
                        position: position + 1,
                        points: points
                    });
                });
            });

            return Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);
        }

        // Visualizza lista eventi
        function displayEventList() {
            const eventList = document.getElementById('eventList');
            if (eventRankings.length === 0) {
                eventList.innerHTML = '';
                return;
            }

            let html = '<h3 style="color: #667eea; margin-top: 20px; margin-bottom: 10px;">📋 Sfide Registrate</h3>';
            
            eventRankings.forEach((event, index) => {
                html += `
                    <div class="event-item">
                        <div class="event-item-info">
                            <div class="event-item-title">${event.name}</div>
                            <div class="event-item-players">Top 3: ${event.rankings.slice(0, 3).join(', ')}</div>
                        </div>
                        <button class="btn btn-danger" onclick="deleteEvent(${index})" style="padding: 8px 15px;">🗑️</button>
                    </div>
                `;
            });

            eventList.innerHTML = html;
        }

        // Visualizza la classifica
        function displayLeaderboard() {
            const leaderboard = document.getElementById('leaderboard');
            const sortedPlayers = calculateTotalPoints();

            if (sortedPlayers.length === 0) {
                leaderboard.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nessuna sfida registrata. Aggiungi la prima sfida!</p>';
                return;
            }

            leaderboard.innerHTML = '';
            sortedPlayers.forEach((player, index) => {
                const row = document.createElement('div');
                row.className = 'player-row';

                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
                const trophy = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

                row.innerHTML = `
                    <div class="rank ${rankClass}">${index + 1}</div>
                    <div class="player-name">${player.name} ${trophy}</div>
                    <div class="events-count">${player.eventsParticipated} eventi</div>
                    <div class="total-points">${player.totalPoints.toLocaleString()}</div>
                `;

                leaderboard.appendChild(row);
            });

            // Aggiorna statistiche
            document.getElementById('totalEvents').textContent = eventRankings.length;
            document.getElementById('totalPlayers').textContent = sortedPlayers.length;
            document.getElementById('totalPoints').textContent = 
                sortedPlayers.reduce((sum, p) => sum + p.totalPoints, 0).toLocaleString();
        }

        // Mostra dettagli
        function toggleDetails() {
            const detailsSection = document.getElementById('detailsSection');
            
            if (detailsSection.classList.contains('hidden')) {
                detailsSection.classList.remove('hidden');
                
                const sortedPlayers = calculateTotalPoints();
                
                let html = '<h3 style="color: #667eea; margin-bottom: 15px;">Dettaglio Gemme per Giocatore</h3>';
                
                sortedPlayers.forEach(player => {
                    html += `
                        <h4 style="margin-top: 20px; color: #333;">${player.name} - ${player.totalPoints.toLocaleString()} punti totali</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sfida</th>
                                    <th>Posizione</th>
                                    <th>Gemme</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    
                    player.eventDetails.forEach(detail => {
                        html += `
                            <tr>
                                <td>${detail.eventName}</td>
                                <td>${detail.position}°</td>
                                <td>${detail.points.toLocaleString()}</td>
                            </tr>
                        `;
                    });
                    
                    html += '</tbody></table>';
                });
                
                detailsSection.innerHTML = html;
            } else {
                detailsSection.classList.add('hidden');
            }
        }

        // Esporta dati
        function exportData() {
            const dataStr = JSON.stringify(eventRankings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `eventi_classifica_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }

        // Importa dati
        function importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (confirm('Vuoi sostituire i dati esistenti o aggiungerli?\\n\\nOK = Sostituisci\\nAnnulla = Aggiungi')) {
                        eventRankings = imported;
                    } else {
                        imported.forEach(event => {
                            event.event = eventRankings.length + 1;
                            eventRankings.push(event);
                        });
                    }
                    saveData();
                    updateDisplay();
                    alert('✅ Dati importati con successo!');
                } catch (error) {
                    alert('❌ Errore nell\'importazione del file!');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        // Reset tutti i dati
        function resetAllData() {
            if (confirm('⚠️ ATTENZIONE! Questa operazione cancellerà TUTTI gli eventi e non può essere annullata. Sei sicuro?')) {
                eventRankings = [];
                saveData();
                updateDisplay();
                alert('✅ Tutti i dati sono stati cancellati!');
            }
        }

        // Aggiorna display
        function updateDisplay() {
            displayEventList();
            displayLeaderboard();
            document.getElementById('detailsSection').classList.add('hidden');
            document.getElementById('detailsSection').innerHTML = '';
        }

        // Inizializza
        loadData();
        updateDisplay();