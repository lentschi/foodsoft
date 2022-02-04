
const StyleUtil = {
  stringToColour: (str: string): string => {
    let hash = 0;
    const characterCodes = Array.from(str)
      .map(character => character.charCodeAt(0));

    for (const characterCode of characterCodes) {
      hash = characterCode + ((hash << 5) - hash);
    }

    return Array.from(['red', 'green', 'blue'].keys())
      .map(index => hash >> index * 8 & 0xFF)
      .join(',');
  },
};

export default StyleUtil;
