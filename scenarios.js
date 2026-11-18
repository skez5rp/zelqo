const battery = ['battery', 'Battery', ['78%']];
const presets = {
  walk: {
    title: 'Navigation', image: 'walk.webp', focus: 'center',
    description: 'Follow a route from a café to the waterfront. The next turn and arrival estimate update along the way.',
    notes: ['The route starts outside the café.', 'Turn right at the approaching junction.', 'Follow the street to the waterfront.'],
    widgets: [
      ['turn', 'Next turn', ['Right in 120 m', 'Right in 35 m', 'Straight for 250 m']],
      ['eta', 'Time to arrival', ['7 min', '6 min', '4 min']],
      ['distance', 'Distance left', ['520 m', '435 m', '250 m']], battery
    ]
  },
  talk: {
    title: 'Captions', image: 'talk.webp', focus: 'center 38%',
    description: 'Follow a conversation in a busy café with captions and a speaker label.',
    notes: ['Anna suggests a meeting place.', 'The next line appears as Anna speaks.', 'Anna confirms the plan.'],
    widgets: [
      ['subtitles', 'Caption', ['Let’s meet at the entrance.', 'I’ll be there at seven.', 'Sounds good. See you there!']],
      ['speaker', 'Speaker', ['Anna']],
      ['language', 'Language', ['English']], battery
    ]
  },
  stage: {
    title: 'On stage', image: 'stage.webp', focus: 'center',
    description: 'Keep track of the set with a running timer, the next song and a cue for each transition.',
    notes: ['The next song is about to start.', 'A cue appears during the song.', 'The final song is up next.'],
    widgets: [
      ['song', 'Set list', ['Next: North Wind', 'Playing: North Wind', 'Next: After Dark']],
      ['timer', 'Time on stage', ['14:28', '14:31', '14:34']],
      ['cue', 'Stage cue', ['Check the mic', 'Pause after the chorus', 'Switch to clean tone']], battery
    ]
  },
  travel: {
    title: 'Travel', image: 'walk.webp', focus: 'right 32%',
    description: 'Find a museum entrance and keep the opening hours and ticket details in view.',
    notes: ['Approach the museum from the square.', 'The entrance is around the corner.', 'The room number appears once you arrive.'],
    widgets: [
      ['landmark', 'Place', ['Museum · 180 m', 'Entrance around the corner · 40 m', 'Museum entrance']],
      ['hours', 'Opening hours', ['Until 7 pm']],
      ['ticket', 'Ticket', ['Entry at 5:30 pm', 'Entry at 5:30 pm', 'Room 2']], battery
    ]
  },
  translate: {
    title: 'Translation', image: 'talk.webp', focus: 'left 43%',
    description: 'Read a short café conversation with the English translation next to the original French.',
    notes: ['You ask whether a table is free.', 'The reply appears in French and English.', 'The other guest invites you to sit.'],
    widgets: [
      ['translation', 'Translation', ['Is this table free?', 'Yes, we just got here.', 'Please, have a seat.']],
      ['source', 'Original', ['Cette table est libre ?', 'Oui, on vient d’arriver.', 'Asseyez-vous, je vous en prie.']],
      ['languages', 'Languages', ['French to English']], battery
    ]
  },
  rehearsal: {
    title: 'Rehearsal', image: 'stage.webp', focus: 'left 35%',
    description: 'Practice your entrance with a countdown and a short cue for each step.',
    notes: ['The introduction starts in 15 seconds.', 'Take a moment to look up at the audience.', 'Start with your opening line.'],
    widgets: [
      ['countdown', 'Countdown', ['00:15', '00:05', '00:00']],
      ['prompt', 'Cue', ['Walk up to the mic', 'Look up at the audience', 'Begin the introduction']],
      ['segment', 'Section', ['Introduction · take 2']], battery
    ]
  }
};
