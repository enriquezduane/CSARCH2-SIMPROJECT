function decimalToUnpackedBCD(number) {
    return convertToBCD("%8s", number);
}

function decimalToPackedBCD(number) {
    return convertToBCD("%4s", number);
}

function convertToBCD(format, number) {
    let negative = false;

    // if negative, convert to positive but flag as negative
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

    // if negative, add 1101 at LS nibble
    if (negative) {
        converted += "1101".padStart(format === "%8s" ? 8 : 4, '0');
    }

    return converted;
}

function decimalToDenselyPackedBCD(number) {
    if (number < 0) {
        number *= -1;
    }
    return convertToDenselyPacked(Array.from(decimalToPackedBCD(number)));
}

function convertToDenselyPacked(packed) {
    let keys = [packed[0], packed[4], packed[8]];

    if (keys.every(k => k === '0')) {
        return [
            packed[1], packed[2], packed[3], packed[5], packed[6], packed[7],
            '0', packed[9], packed[10], packed[11]
        ].join('');
    } else if (keys[0] === '0' && keys[1] === '0' && keys[2] === '1') {
        return [
            packed[1], packed[2], packed[3], packed[5], packed[6], packed[7],
            '1', '0', '0', packed[11]
        ].join('');
    } else if (keys[0] === '0' && keys[1] === '1' && keys[2] === '0') {
        return [
            packed[1], packed[2], packed[3], packed[9], packed[10], packed[7],
            '1', '0', '1', packed[11]
        ].join('');
    } else if (keys[0] === '0' && keys[1] === '1' && keys[2] === '1') {
        return [
            packed[1], packed[2], packed[3], '1', '0', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    } else if (keys[0] === '1' && keys[1] === '0' && keys[2] === '0') {
        return [
            packed[9], packed[10], packed[3], packed[5], packed[6], packed[7],
            '1', '1', '0', packed[11]
        ].join('');
    } else if (keys[0] === '1' && keys[1] === '0' && keys[2] === '1') {
        return [
            packed[5], packed[6], packed[3], '0', '1', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    } else if (keys[0] === '1' && keys[1] === '1' && keys[2] === '0') {
        return [
            packed[9], packed[10], packed[3], '0', '0', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    } else if (keys[0] === '1' && keys[1] === '1' && keys[2] === '1') {
        return [
            '0', '0', packed[3], '1', '1', packed[7],
            '1', '1', '1', packed[11]
        ].join('');
    }

    return "";
}

function denselyPackedBCDtoDecimal(dense) {
    return convertToDecimal(Array.from(dense));
}

function convertToDecimal(dense) {
    let keys = [dense[6], dense[7], dense[8], dense[3], dense[4]];
    let packed = ['0'];
    let decimal = 0;

    if (keys[0] === '0') {
        packed = [
            '0', dense[0], dense[1], dense[2], '0',
            dense[3], dense[4], dense[5], '0',
            dense[7], dense[8], dense[9]
        ];
    } else if (keys[0] === '1' && keys[1] === '0' && keys[2] === '0') {
        packed = [
            '0', dense[0], dense[1], dense[2], '0',
            dense[3], dense[4], dense[5], '1',
            '0', '0', dense[9]
        ];
    } else if (keys[0] === '1' && keys[1] === '0' && keys[2] === '1') {
        packed = [
            '0', dense[0], dense[1], dense[2], '1',
            '0', '0', dense[5], '0',
            dense[3], dense[4], dense[9]
        ];
    } else if (keys[0] === '1' && keys[1] === '1' && keys[2] === '0') {
        packed = [
            '1', '0', '0', dense[2], '0',
            dense[3], dense[4], dense[5], '0',
            dense[0], dense[1], dense[9]
        ];
    } else if (keys.join('') === '11100') {
        packed = [
            '1', '0', '0', dense[2], '1',
            '0', '0', dense[5], '0',
            dense[0], dense[1], dense[9]
        ];
    } else if (keys.join('') === '11101') {
        packed = [
            '1', '0', '0', dense[2], '0',
            dense[0], dense[1], dense[5], '1',
            '0', '0', dense[9]
        ];
    } else if (keys.join('') === '11110') {
        packed = [
            '0', dense[0], dense[1], dense[2], '1',
            '0', '0', dense[5], '1',
            '0', '0', dense[9]
        ];
    } else if (keys.join('') === '11111') {
        packed = [
            '1', '0', '0', dense[2], '1',
            '0', '0', dense[5], '1',
            '0', '0', dense[9]
        ];
    }

    for (let i = 0; i < 12; i++) {
        if (packed[i] === '1') {
            let mult = 1;
            if (i <= 3) {
                mult = 100;
            } else if (i <= 7) {
                mult = 10;
            }
            let e = 3 - (i % 4);
            decimal += (Math.pow(2, e) * mult);
        }
    }

    return decimal;
}

function validateInput(input) {
    if (isNaN(input) || input.trim() === "") {
        document.getElementById('errorAudio').play();
        showErrorDialog();
        return false;
    }
    return true;
}

function showErrorDialog() {
    document.getElementById('errorDialog').classList.remove('hidden');
}

function closeErrorDialog() {
    document.getElementById('errorDialog').classList.add('hidden');
}

function generateBCD() {
    const decimalInput = document.getElementById('decimalInput').value;
    if (!validateInput(decimalInput)) {
        return;
    }

    const unpackedBCD = decimalToUnpackedBCD(decimalInput);
    document.getElementById('unpackedBCDOutput').value = unpackedBCD;

    const packedBCD = decimalToPackedBCD(decimalInput);
    document.getElementById('packedBCDOutput').value = packedBCD;

    const denselyPackedBCD = decimalToDenselyPackedBCD(decimalInput);
    document.getElementById('denselyPackedBCDOutput').value = denselyPackedBCD;

    if (document.getElementById('outputToFile').checked) {
        downloadResultsAsFile(unpackedBCD, packedBCD, denselyPackedBCD);
    }
}

function translateBCD() {
    const denselyPackedBCDInput = document.getElementById('denselyPackedBCDInput').value;
    if (!validateInput(denselyPackedBCDInput)) {
        return;
    }

    const decimal = denselyPackedBCDtoDecimal(denselyPackedBCDInput);
    document.getElementById('decimalOutput').value = decimal;

    if (document.getElementById('outputToFile').checked) {
        downloadResultAsFile(decimal, 'DenselyPackedBCDtoDecimal');
    }
}

function downloadResultsAsFile(unpackedBCD, packedBCD, denselyPackedBCD) {
    const content = `Unpacked BCD: ${unpackedBCD}\nPacked BCD: ${packedBCD}\nDensely-packed BCD: ${denselyPackedBCD}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'BCD_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadResultAsFile(result, conversionType) {
    const blob = new Blob([result], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${conversionType}_result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
