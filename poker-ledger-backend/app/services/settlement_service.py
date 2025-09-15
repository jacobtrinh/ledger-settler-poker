from typing import List
from sqlalchemy.orm import Session

from app import models


def calculate_settlements_for_session(db: Session, game_session_id: int) -> models.GameSession:
    """
    Calculate settlements for a game session based on player buy-ins and cash-outs.
    This mirrors the logic from the frontend settlementCalculator.ts
    """
    # Get the game session with players
    game_session = db.query(models.GameSession).filter(
        models.GameSession.id == game_session_id
    ).first()
    
    if not game_session:
        raise ValueError("Game session not found")
    
    # Clear existing settlements
    db.query(models.Settlement).filter(
        models.Settlement.game_session_id == game_session_id
    ).delete()
    
    # Calculate net results for each player
    players_with_net = []
    for player in game_session.players:
        players_with_net.append({
            'name': player.name,
            'net_result': player.cash_out - player.buy_in
        })
    
    # Separate winners and losers
    winners = [p for p in players_with_net if p['net_result'] > 0]
    losers = [p for p in players_with_net if p['net_result'] < 0]
    
    # Sort winners by net result (descending) and losers by net result (ascending)
    winners.sort(key=lambda x: x['net_result'], reverse=True)
    losers.sort(key=lambda x: x['net_result'])
    
    # Create copies to track remaining amounts
    winners_to_settle = [{'name': w['name'], 'remaining': w['net_result']} for w in winners]
    losers_to_settle = [{'name': l['name'], 'remaining': abs(l['net_result'])} for l in losers]
    
    # Match losers with winners
    settlements = []
    for loser in losers_to_settle:
        for winner in winners_to_settle:
            if loser['remaining'] == 0 or winner['remaining'] == 0:
                continue
            
            amount = min(loser['remaining'], winner['remaining'])
            
            # Create settlement record
            settlement = models.Settlement(
                from_player=loser['name'],
                to_player=winner['name'],
                amount=round(amount, 2),
                game_session_id=game_session_id
            )
            settlements.append(settlement)
            
            loser['remaining'] -= amount
            winner['remaining'] -= amount
    
    # Save all settlements
    db.add_all(settlements)
    
    # Mark game session as settled
    game_session.is_settled = True
    
    db.commit()
    db.refresh(game_session)
    
    return game_session 