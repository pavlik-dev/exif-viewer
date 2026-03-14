const TYPE_SIZES = {
    1: 1,
    2: 1,
    3: 2,
    4: 4,
    5: 8,
    10: 8
}
const TYPE_NAMES = { 1: 'BYTE', 2: 'ASCII', 3: 'SHORT', 4: 'LONG', 5: 'RATIONAL', 10: 'SRATIONAL' }

const BasicTags = [0x10f, 0x110, 0x132, 0x9209, 0x9286]

const FIELD_NAMES = {
    0x0001: "InteropIndex",
    0x0002: "InteropVersion",
    0x000b: "ProcessingSoftware",
    0x00fe: "SubfileType",
    0x00ff: "OldSubfileType",
    0x0100: "ImageWidth",
    0x0101: "ImageHeight",
    0x0102: "BitsPerSample",
    0x0103: "Compression",
    0x0106: "PhotometricInterpretation",
    0x0107: "Thresholding",
    0x0108: "CellWidth",
    0x0109: "CellLength",
    0x010a: "FillOrder",
    0x010d: "DocumentName",
    0x010e: "ImageDescription",
    0x010f: "Make",
    0x0110: "Model",
    0x0111: "StripOffsets",
    0x0112: "Orientation",
    0x0115: "SamplesPerPixel",
    0x0116: "RowsPerStrip",
    0x0117: "StripByteCounts",
    0x0118: "MinSampleValue",
    0x0119: "MaxSampleValue",
    0x011a: "XResolution",
    0x011b: "YResolution",
    0x011c: "PlanarConfiguration",
    0x011d: "PageName",
    0x011e: "XPosition",
    0x011f: "YPosition",
    0x0122: "GrayResponseUnit",
    0x0128: "ResolutionUnit",
    0x0129: "PageNumber",
    0x0131: "Software",
    0x0132: "ModifyDate",
    0x013b: "Artist",
    0x013c: "HostComputer",
    0x013d: "Predictor",
    0x013e: "WhitePoint",
    0x013f: "PrimaryChromaticities",
    0x0142: "TileWidth",
    0x0143: "TileLength",
    0x0147: "CleanFaxData",
    0x014c: "InkSet",
    0x0151: "TargetPrinter",
    0x015a: "Indexed",
    0x015f: "OPIProxy",
    0x0191: "ProfileType",
    0x0192: "FaxProfile",
    0x0201: "ThumbnailOffset",
    0x0202: "ThumbnailLength",
    0x0211: "YCbCrCoefficients",
    0x0212: "YCbCrSubSampling",
    0x0213: "YCbCrPositioning",
    0x0214: "ReferenceBlackWhite",
    0x02bc: "ApplicationNotes",
    0x0303: "RenderingIntent",
    0x1000: "RelatedImageFileFormat",
    0x1001: "RelatedImageWidth",
    0x1002: "RelatedImageHeight",
    0x4746: "Rating",
    0x4749: "RatingPercent",
    0x7000: "SonyRawFileType",
    0x7031: "VignettingCorrection",
    0x7034: "ChromaticAberrationCorrection",
    0x7036: "DistortionCorrection",
    0x8298: "Copyright",
    0x829a: "ExposureTime",
    0x829d: "FNumber",
    0x8769: "ExifOffset",
    0x8822: "ExposureProgram",
    0x8824: "SpectralSensitivity",
    0x8825: "GPSInfo",
    0x8827: "ISO",
    0x8830: "SensitivityType",
    0x8832: "RecommendedExposureIndex",
    0x9000: "ExifVersion",
    0x9003: "DateTimeOriginal",
    0x9004: "CreateDate",
    0x9101: "ComponentsConfiguration",
    0x9201: "ShutterSpeedValue",
    0x9202: "ApertureValue",
    0x9203: "BrightnessValue",
    0x9204: "ExposureCompensation",
    0x9205: "MaxApertureValue",
    0x9206: "SubjectDistance",
    0x9207: "MeteringMode",
    0x9208: "LightSource",
    0x9209: "Flash",
    0x920a: "FocalLength",
    0x927c: "MakerNote",
    0x9286: "UserComment",
    0xa000: "FlashpixVersion",
    0xa001: "ColorSpace",
    0xa002: "PixelXDimension",
    0xa003: "PixelYDimension",
    0xa404: "DigitalZoomRatio",
    0xa405: "FocalLengthIn35mmFilm",
    0xa420: "ImageUniqueID"
}

const GPS_TAG_NAMES = {
    0x0000: "GPSVersionID",
    0x0001: "GPSLatitudeRef",
    0x0002: "GPSLatitude",
    0x0003: "GPSLongitudeRef",
    0x0004: "GPSLongitude",
    0x0005: "GPSAltitudeRef",
    0x0006: "GPSAltitude",
    0x0007: "GPSTimeStamp",
    0x001B: "GPSProcessingMethod",
    0x001D: "GPSDateStamp"
}

const EXIF_OFFSET_TAG = 0x8769
const GPS_INFO_TAG = 0x8825

const IIuint8 = new Uint8Array([73, 73])
const MMuint8 = new Uint8Array([77, 77])
const TIFFmagic = new Uint8Array([0, 0x2a])
console.log(IIuint8, MMuint8, TIFFmagic)

class Field {
    tag = undefined; // ushort (2 bytes)
    tag_name = undefined; // string
    typ = undefined; // ushort (2 bytes)
    count = undefined; // uint32 (4 bytes)
    value_offset = undefined; // uint32 (4 bytes)
    value_data = undefined; // uint8array
    decoded = undefined; // string/number

    constructor({
        tag,
        tag_name,
        typ,
        count,
        value_offset,
        value_data,
        decoded,
    } = {}) {
        this.tag = tag;
        this.tag_name = tag_name;
        this.typ = typ;
        this.count = count;
        this.value_offset = value_offset;
        this.value_data = value_data;
        this.decoded = decoded;
    }
}

class ExifError extends Error {}
class NoExifHeaderFoundError extends ExifError {
    message = undefined
    constructor(message = "No EXIF header found.") {
        super(message)
        this.message = message
    }
}
class InvalidTiffByteOrderError extends ExifError {
    message = undefined
    constructor(message = "Invalid TIFF byte order.") {
        super(message)
        this.message = message
    }
}
class InvalidTiffMagicNumberError extends ExifError {
    message = undefined
    constructor(message = "Invalid TIFF magic number.") {
        super(message)
        this.message = message
    }
}

/* helper functions */
function findSequence(data, sequence) {
    const seqLen = sequence.length;
    // We only need to loop until there's no room left for the sequence
    for (let i = 0; i <= data.length - seqLen; i++) {
        // Check if the first byte matches to skip the heavy lifting
        if (data[i] === sequence[0]) {
            const slice = data.subarray(i, i + seqLen);
            if (slice.every((byte, index) => byte === sequence[index])) {
                return i; // Found it
            }
        }
    }
    return -1;
}

function areBuffersEqual(buf1, buf2) {
    if (buf1.length !== buf2.length) return false;
    for (let i = 0; i < buf1.length; i++) {
        if (buf1[i] !== buf2[i]) return false;
    }
    return true;
}

function uint8arrayToUshort(array, endian = false) {
    return new DataView(array.buffer).getUint16(0, endian)
}

function uint8arrayToUint32(array, endian = false) {
    return new DataView(array.buffer).getUint32(0, endian)
}

function uint8arrayToInt32(array, endian = false) {
    return new DataView(array.buffer).getInt32(0, endian)
}

const rationaltypes = { 5: uint8arrayToUint32, 10: uint8arrayToInt32 }


/* EXIF reader functions */

/**
 * Decode a tag value according to its type.
 * @param {Uint8Array} data - The full TIFF binary data.
 * @param {boolean} endian - true for little-endian, false for big-endian.
 * @param {number} tiffStart - The start index of the TIFF header.
 * @param {number} typ - The tag type.
 * @param {number} count - Number of values.
 * @param {number} valueOffset - The 4-byte value or offset field.
 */
function readValue(data, endian, tiffStart, typ, count, valueOffset) {
    // Assuming TYPE_SIZES is globally defined or passed in
    const size = (TYPE_SIZES[typ] || 1) * count;

    if (size <= 4) {
        // For small values (<= 4 bytes), the offset field *is* the value.
        // We pack the 32-bit integer into a buffer based on endianness,
        // then slice it to the actual data size.
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setUint32(0, valueOffset, endian);

        return new Uint8Array(buffer).slice(0, size);
    } else {
        // For larger values, the field is a pointer to the actual data.
        const start = tiffStart + valueOffset;
        return data.slice(start, start + size);
    }
}

function parse_ifd(data, endian, tiff_start, offset, label = "IFD", is_gps = false) {
    if (offset == 0) return

    const ifd_pos = tiff_start + offset
    if (ifd_pos + 2 > data.length) return

    const num_entries_slice = data.slice(ifd_pos, ifd_pos + 2)
    console.log(num_entries_slice)

    const num_entries = uint8arrayToUshort(num_entries_slice, endian)

    console.log(`Found ${label} with ${num_entries} entries`)

    let pos = ifd_pos + 2

    let result = [];

    for (var i = 0; i < num_entries; ++i) {
        const entry = data.slice(pos, pos + 12)
        if (entry.length < 12) break;

        const tag = uint8arrayToUshort(entry.slice(0, 2), endian)
        const typ = uint8arrayToUshort(entry.slice(2, 4), endian)
        const count = uint8arrayToUint32(entry.slice(4, 8), endian)
        const value_offset = uint8arrayToUint32(entry.slice(8, 12), endian)

        console.log(tag, typ, count, value_offset)

        const value_data = readValue(data, endian, tiff_start, typ, count, value_offset)

        console.log(value_data)

        var decoded = null

        if (typ == 2) {
            // ASCII
            decoded = new TextDecoder().decode(value_data).split('\x00')[0].trim();
        }
        else if (typ == 3) {
            // SHORT
            decoded = uint8arrayToUshort(value_data, endian)
        }
        else if (typ == 4) {
            // LONG
            decoded = uint8arrayToUint32(value_data, endian)
        }
        else if (typ == 5 || typ == 10) {
            // RATIONAL or SRATIONAL
            decoded = []
            fmt = rationaltypes[typ]
            for (var j = 0; j < count; ++j) {
                const slice1 = value_data.slice(j * 8, j * 8 + 4)
                const slice2 = value_data.slice(j * 8 + 4, j * 8 + 8)
                const num = fmt(slice1, endian)
                const den = fmt(slice2, endian)
                decoded.push(`${num}/${den || 0}`)
            }
        }
        else {
            decoded = value_data.toHex()
        }

        tag_name = (is_gps ? GPS_TAG_NAMES : FIELD_NAMES)[tag] || tag.toString(16)

        console.log(`Tag: ${tag_name} | Type: ${typ} | Value: ${decoded}`)
        console.warn(result, result.constructor, result.push)
        result.push(new Field({ tag, tag_name, typ, count, value_offset, value_data, decoded }))
        pos += 12

        if (tag == EXIF_OFFSET_TAG) {
            sub_offset = (decoded instanceof Array) ? decoded[0] : decoded
            var subfields = parse_ifd(data, endian, tiff_start, Number(sub_offset), "Exif Sub-IFD", false)
            if (subfields) result.push(...subfields)
        }
        else if (tag == GPS_INFO_TAG) {
            sub_offset = (decoded instanceof Array) ? decoded[0] : decoded
            var subfields = parse_ifd(data, endian, tiff_start, Number(sub_offset), "GPS Info IFD", true)
            console.log(subfields)
            if (subfields) result.push(...subfields)
        }
    }

    return result
}

function parse_exif(data) {
    const start = findSequence(data.slice(0, 256), [0x45, 0x78, 0x69, 0x66, 0, 0])
    if (start == -1) {
        throw new NoExifHeaderFoundError()
    } else {
        console.log(`Found EXIF header at index ${start}`);
    }

    const tiff_start = start + 6
    const byte_order = data.slice(tiff_start, tiff_start + 2)
    const endian = areBuffersEqual(byte_order, IIuint8) ? true :
         areBuffersEqual(byte_order, MMuint8) ? false :
         (() => { throw new InvalidTiffByteOrderError() })();

    const tiff_magic_number = data.slice(tiff_start + 2, tiff_start + 4)

    const tiff_match = (
        (!endian && areBuffersEqual(tiff_magic_number, TIFFmagic)) ||
        (endian && areBuffersEqual(tiff_magic_number, TIFFmagic.reverse()))
    )

    if (!tiff_match) {
        console.warn(tiff_magic_number)
        console.error("Invalid TIFF magic number.")
        return
    } else {
        console.log('TIFF matches')
    }

    const ifd0_offset = uint8arrayToUint32(data.slice(tiff_start + 4, tiff_start + 8), endian)

    console.log(ifd0_offset)

    return parse_ifd(data, endian, tiff_start, ifd0_offset, "IFD0", false)
}
