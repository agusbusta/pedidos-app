export const mockEnviarAlertaDemora = jest.fn().mockResolvedValue(undefined);
export const mockEnviarAlertaNoEntregado = jest.fn().mockResolvedValue(undefined);

export const EmailService = jest.fn().mockImplementation(() => ({
  enviarAlertaDemora: mockEnviarAlertaDemora,
  enviarAlertaNoEntregado: mockEnviarAlertaNoEntregado
})); 