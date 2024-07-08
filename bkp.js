function roundToNearestEven(num) {
    const rounded = Math.round(num);
    if (num % 1 === 0.5 && rounded % 2 !== 0) {
        return rounded - 1;
    }
    return rounded;
}

function formatUnpackedBCD(bcd) {
    return bcd.replace(/(.{8})/g, '$1 ').trim();
}

function formatPackedBCD(bcd) {
    return bcd.replace(/(.{4})/g, '$1 ').trim();
}

function formatDenselyPackedBCD(bcd) {
    return `${bcd.slice(0, 3)} ${bcd.slice(3, 6)} ${bcd.slice(6, 7)} ${bcd.slice(7, 10)}`;
}

function decimalToUnpackedBCD(number) {
    let bcd = convertToBCD("%8s", number);
    return formatUnpackedBCD(bcd);
}

function decimalToPackedBCD(number) {
    let bcd = convertToBCD("%4s", number);
    return formatPackedBCD(bcd);
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
    let numberStr = String(Math.abs(number));
    // Pad the number string so its length is a multiple of 3
    while (numberStr.length % 3 !== 0) {
        numberStr = '0' + numberStr;
    }

    let denselyPackedBCD = '';
    for (let i = 0; i < numberStr.length; i += 3) {
        let chunk = numberStr.substring(i, i + 3);
        let packedBCD = decimalToPackedBCD(chunk).replace(/ /g, ''); // Remove spaces for internal processing
        let denseChunk = convertToDenselyPacked(Array.from(packedBCD));
        denselyPackedBCD += formatDenselyPackedBCD(denseChunk) + ' ';
    }

    return denselyPackedBCD.trim();
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
    dense = dense.replace(/\s+/g, ''); // Remove spaces
    let decimalResult = '';

    // Process the densely packed BCD in chunks of 10 digits
    for (let i = 0; i < dense.length; i += 10) {
        let chunk = dense.substring(i, i + 10);
        decimalResult += convertToDecimal(Array.from(chunk)).toString().padStart(3, '0');
    }

    // Remove any leading zeros for the final output
    return parseInt(decimalResult, 10).toString();
}

function convertToDecimal(dense) {
    let keys = [dense[6], dense[7], dense[8], dense[3], dense[4]];
    let packed = [];
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

function validateDecimalInput(input) {
    if (isNaN(input) || input.trim() === "") {
        document.getElementById('errorAudio').play();
        showErrorDialog();
        return false;
    }
    return true;
}

function validateBCDInput(input) {
    if (!/^[01\s]+$/.test(input) || input.trim() === "") {
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
    let decimalInput = document.getElementById('decimalInput').value;


    if (!validateDecimalInput(decimalInput)) {
        return;
    }

    decimalInput = roundToNearestEven(parseFloat(decimalInput));

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
    if (!validateBCDInput(denselyPackedBCDInput)) {
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

