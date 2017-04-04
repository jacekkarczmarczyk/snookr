/**
 * Immutable data object
 */
// class ScoreHistory {
//     constructor(scoreHistory = null) {
//         if (scoreHistory === null) {
//             this.scoreHistory = [];
//         } else if (scoreHistory.constructor === Array) {
//             this.scoreHistory = scoreHistory.slice(0);
//         } else {
//             this.scoreHistory = scoreHistory.getEntries();
//         }
//     }
//
//     getEntries() {
//         return this.scoreHistory.slice(0);
//     }
//
//     getCurrentScore() {
//         return this.scoreHistory.reduce(function (scores, scoreEntry) {
//             scores[scoreEntry.getPlayerId()] = (scores[scoreEntry.getPlayerId()] || 0) + scoreEntry.getValue();
//             return scores;
//         }, {});
//     }
//
//     appendScore(scoreEntry) {
//         const scoreHistory = this.scoreHistory.slice(0);
//         scoreHistory.push(scoreEntry);
//         return new ScoreHistory(scoreHistory);
//     }
// }

/**
 * Immutable data object
 */
// class ScoreEntry {
//     constructor(playerId, value) {
//         this.playedId = playerId;
//         this.value = value;
//     }
//
//     getPlayerId() {
//         return this.playedId;
//     }
//
//     getValue() {
//         return this.value;
//     }
// }


/**
 * Immutable data object
 */
// class State {
//     constructor(state = null) {
//         if (state) {
//             this.ballsPositions = state.getBallsPositions();
//             this.scoreHistory = state.getScoreHistory();
//         }
//     }
//
//     getBallsPositions() {
//         return this.ballsPositions;
//     }
//
//     getScoreHistory() {
//         return this.scoreHistory;
//     }
// }


