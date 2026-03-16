ALTER TABLE processos DROP CONSTRAINT processos_triagem_resultado_check;
UPDATE processos SET triagem_resultado = 'convertido' WHERE triagem_resultado = 'apto';
UPDATE processos SET triagem_resultado = 'em_acompanhamento' WHERE triagem_resultado = 'reanálise';
ALTER TABLE processos ADD CONSTRAINT processos_triagem_resultado_check CHECK (triagem_resultado = ANY (ARRAY['pendente'::text, 'em_acompanhamento'::text, 'convertido'::text, 'descartado'::text]));