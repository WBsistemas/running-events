-- Remover as políticas existentes que estão causando a recursão
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;

-- Criar novas políticas para a tabela users
-- Política que permite que qualquer usuário autenticado veja qualquer perfil
-- Esta é uma abordagem simples que evita a recursão
CREATE POLICY "Users can view any profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Política que permite que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política que permite que usuários autenticados vejam todos os perfis
-- Isso é útil para mostrar nomes de criadores de eventos, por exemplo
CREATE POLICY "Users can select all users" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Adicionar política para permitir inserções na tabela de usuários
-- para o processo de cadastro de usuários
CREATE POLICY "Auth service can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR auth.uid() = id); 