describe('Application Tests', () => {
    it('should return true for a simple test', () => {
        expect(true).toBe(true);
    });
});
describe('File Filter Tests', () => {
  const mockCb = jest.fn();

  it('should accept a JPEG image', () => {
    const mockFile = { mimetype: 'image/jpeg' };
    fileFilter(null, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(null, true);
  });

  it('should accept a PNG image', () => {
    const mockFile = { mimetype: 'image/png' };
    fileFilter(null, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(null, true);
  });

  it('should accept a GIF image', () => {
    const mockFile = { mimetype: 'image/gif' };
    fileFilter(null, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(null, true);
  });

  it('should accept a PDF file', () => {
    const mockFile = { mimetype: 'application/pdf' };
    fileFilter(null, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(null, true);
  });

  it('should reject an unsupported file type', () => {
    const mockFile = { mimetype: 'text/plain' };
    fileFilter(null, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(new Error("El archivo debe ser una imagen o un PDF"));
  });
});