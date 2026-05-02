CREATE POLICY "Walker or dog owner can delete walks"
  ON public.walks FOR DELETE
  TO authenticated
  USING (
    walker_id = auth.uid()
    OR dog_id IN (SELECT id FROM public.dogs WHERE owner_id = auth.uid())
  );
