function roundToNTE(num) {
    const rounded = Math.round(num);
    if (num % 1 === 0.5 && rounded % 2 !== 0) {
        return rounded - 1;
    }
    return rounded;
}

function formatUnpacked(bcd) {
    return bcd.replace(/(.{8})/g, '$1 ').trim();
}

function formatPacked(bcd) {
    return bcd.replace(/(.{4})/g, '$1 ').trim();
}

function formatDense(bcd) {
    return `${bcd.slice(0, 3)} ${bcd.slice(3, 6)} ${bcd.slice(6, 7)} ${bcd.slice(7, 10)}`;
}

function decimalToUnpacked(number) {
    let bcd = toBCD("%8s", number);
    return formatUnpacked(bcd);
}

function decimalToPacked(number) {
    let bcd = toBCD("%4s", number);
    return formatPacked(bcd);
}

function toBCD(format, number) {
    let negative = false;

    if (number < 0) {
        negative = true;
        number *= -1;
    }

    let convert = String(number);
    let converted = "";

    for (let digit of convert) {
        let binary = Number(digit).toString(2);
        converted += binary.padStart(format === "%8s" ? 8 : 4, '0');
    }

    if (negative) {
        converted += "1101".padStart(format === "%8s" ? 8 : 4, '0');
    }

    return converted;
}

function decimalToDense(number) {
    let numberStr = String(Math.abs(number));
    while (numberStr.length % 3 !== 0) {
        numberStr = '0' + numberStr;
    }

    let denselyPackedBCD = '';
    for (let i = 0; i < numberStr.length; i += 3) {
        let chunk = numberStr.substring(i, i + 3);
        let packedBCD = decimalToPacked(chunk).replace(/ /g, '');
        let denseChunk = toDense(Array.from(packedBCD));
        denselyPackedBCD += formatDense(denseChunk) + ' ';
    }

    return denselyPackedBCD.trim();
}

function toDense(packed) {
    let bits = [packed[0], packed[4], packed[8]];

    if (bits.every(k => k === '0')) {
        return [
            packed[1], packed[2], packed[3], packed[5], packed[6], packed[7],
            '0', packed[9], packed[10], packed[11]
        ].join('');
    } else if (bits[0] === '0' && bits[1] === '0' && bits[2] === '1') {
        return [
            packed[1], packed[2], packed[3], packed[5], packed[6], packed[7],
            '1', '0', '0', packed[11]
        ].join('');
    } else if (bits[0] === '0' && bits[1] === '1' && bits[2] === '0') {
        return [
            packed[1], packed[2], packed[3], packed[9], packed[10], packed[7],
            '1', '0', '1', packed[11]
        ].join('');
    } else if (bits[0] === '0' && bits[1] === '1' && bits[2] === '1') {
        return [
            packed[1], packed[2], packed[3], '1', '0', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    } else if (bits[0] === '1' && bits[1] === '0' && bits[2] === '0') {
        return [
            packed[9], packed[10], packed[3], packed[5], packed[6], packed[7],
            '1', '1', '0', packed[11]
        ].join('');
    } else if (bits[0] === '1' && bits[1] === '0' && bits[2] === '1') {
        return [
            packed[5], packed[6], packed[3], '0', '1', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    } else if (bits[0] === '1' && bits[1] === '1' && bits[2] === '0') {
        return [
            packed[9], packed[10], packed[3], '0', '0', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    } else if (bits[0] === '1' && bits[1] === '1' && bits[2] === '1') {
        return [
            '0', '0', packed[3], '1', '1', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    }

    return "";
}

function denseToDecimal(dense) {
    dense = dense.replace(/\s+/g, '');
    let decimalResult = '';

    for (let i = 0; i < dense.length; i += 10) {
        let chunk = dense.substring(i, i + 10);
        decimalResult += denseChunkToDecimal(Array.from(chunk)).toString().padStart(3, '0');
    }

    return parseInt(decimalResult, 10).toString();
}

function calculateDecimal(packedBits) {
    let decimal = 0;

    if (packedBits[0] === '1') decimal += 800;
    if (packedBits[1] === '1') decimal += 400;
    if (packedBits[2] === '1') decimal += 200;
    if (packedBits[3] === '1') decimal += 100;

    if (packedBits[4] === '1') decimal += 80;
    if (packedBits[5] === '1') decimal += 40;
    if (packedBits[6] === '1') decimal += 20;
    if (packedBits[7] === '1') decimal += 10;

    if (packedBits[8] === '1') decimal += 8;
    if (packedBits[9] === '1') decimal += 4;
    if (packedBits[10] === '1') decimal += 2;
    if (packedBits[11] === '1') decimal += 1;

    return decimal;
}

function denseChunkToDecimal(dense) {
    let bits = [dense[6], dense[7], dense[8], dense[3], dense[4]];
    let packedBits = [];

    if (bits[0] === '0') {
        packedBits = [
            '0', dense[0], dense[1], dense[2], '0',
            dense[3], dense[4], dense[5], '0',
            dense[7], dense[8], dense[9]
        ];
    } else if (bits[0] === '1' && bits[1] === '0' && bits[2] === '0') {
        packedBits = [
            '0', dense[0], dense[1], dense[2], '0',
            dense[3], dense[4], dense[5], '1',
            '0', '0', dense[9]
        ];
    } else if (bits[0] === '1' && bits[1] === '0' && bits[2] === '1') {
        packedBits = [
            '0', dense[0], dense[1], dense[2], '1',
            '0', '0', dense[5], '0',
            dense[3], dense[4], dense[9]
        ];
    } else if (bits[0] === '1' && bits[1] === '1' && bits[2] === '0') {
        packedBits = [
            '1', '0', '0', dense[2], '0',
            dense[3], dense[4], dense[5], '0',
            dense[0], dense[1], dense[9]
        ];
    } else if (bits.join('') === '11100') {
        packedBits = [
            '1', '0', '0', dense[2], '1',
            '0', '0', dense[5], '0',
            dense[0], dense[1], dense[9]
        ];
    } else if (bits.join('') === '11101') {
        packedBits = [
            '1', '0', '0', dense[2], '0',
            dense[0], dense[1], dense[5], '1',
            '0', '0', dense[9]
        ];
    } else if (bits.join('') === '11110') {
        packedBits = [
            '0', dense[0], dense[1], dense[2], '1',
            '0', '0', dense[5], '1',
            '0', '0', dense[9]
        ];
    } else if (bits.join('') === '11111') {
        packedBits = [
            '1', '0', '0', dense[2], '1',
            '0', '0', dense[5], '1',
            '0', '0', dense[9]
        ];
    }

    return calculateDecimal(packedBits);
}

function isValidDecimal(input) {
    if (input.trim() === "") {
        return "Input cannot be empty. Please enter a decimal number.";
    }
    if (isNaN(input)) {
        return "Invalid input. Please enter a valid decimal number.";
    }
    return true;
}

function isValidBCD(input) {
    const cleanInput = input.replace(/\s+/g, '');

    if (cleanInput === "") {
        return "Input cannot be empty. Please enter a BCD number.";
    }
    if (!/^[01]+$/.test(cleanInput)) {
        return "Invalid BCD input. Please use only 0 and 1.";
    }
    if (cleanInput.length % 10 !== 0) {
        return "Invalid densely packed BCD input. The number of digits must be a multiple of 10.";
    }
    return true;
}

function showError(message) {
    const errorDialog = document.getElementById('errorDialog');
    errorDialog.querySelector('p').textContent = message;
    errorDialog.classList.remove('hidden');
    document.getElementById('errorAudio').play();
}

function hideError() {
    document.getElementById('errorDialog').classList.add('hidden');
}

function generateBCD() {
    let decimalInput = document.getElementById('decimalInput').value;
    const validationResult = isValidDecimal(decimalInput);

    if (validationResult !== true) {
        showError(validationResult);
        return;
    }

    decimalInput = roundToNTE(parseFloat(decimalInput));

    const unpackedBCD = decimalToUnpacked(decimalInput);
    document.getElementById('unpackedBCDOutput').value = unpackedBCD;

    const packedBCD = decimalToPacked(decimalInput);
    document.getElementById('packedBCDOutput').value = packedBCD;

    const denselyPackedBCD = decimalToDense(decimalInput);
    document.getElementById('denselyPackedBCDOutput').value = denselyPackedBCD;

    if (document.getElementById('outputToFile').checked) {
        saveBCDResult(unpackedBCD, packedBCD, denselyPackedBCD);
    }
    document.getElementById('successAudio').play();
}

function translateBCD() {
    const denselyPackedBCDInput = document.getElementById('denselyPackedBCDInput').value;
    const validationResult = isValidBCD(denselyPackedBCDInput);

    if (validationResult !== true) {
        showError(validationResult);
        return;
    }

    const decimal = denseToDecimal(denselyPackedBCDInput);
    document.getElementById('decimalOutput').value = decimal;

    if (document.getElementById('outputToFile').checked) {
        saveDecimalResult(decimal, 'DenselyPackedBCDtoDecimal');
    }
    document.getElementById('successAudio').play();
}

function saveBCDResult(unpackedBCD, packedBCD, denselyPackedBCD) {
    const content = `Unpacked BCD: ${unpackedBCD}\nPacked BCD: ${packedBCD}\nDensely-packed BCD: ${denselyPackedBCD}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'BCD_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function saveDecimalResult(result, conversionType) {
    const blob = new Blob([result], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${conversionType}_result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
