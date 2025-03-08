-- Esquema para o banco de dados de eventos de corrida

-- Tabela de usuários (complementa a tabela auth.users do Supabase)
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger para criar automaticamente um perfil de usuário quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tabela de organizadores de eventos
CREATE TABLE organizers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de eventos de corrida
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL, -- Formato: "Month Day, Year"
  time TEXT NOT NULL, -- Formato: "HH:MM AM/PM"
  location TEXT NOT NULL,
  distance TEXT NOT NULL, -- Pode ser múltiplas distâncias separadas por vírgula
  capacity INTEGER NOT NULL,
  participants INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  organizer_id UUID REFERENCES organizers NOT NULL,
  image_url TEXT NOT NULL,
  registration_url TEXT,
  price TEXT NOT NULL, -- Formato: "$XX.XX" ou "Free"
  event_type TEXT NOT NULL, -- "Official Race", "Charity Event", "Trail Run", etc.
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índice para busca por localização
CREATE INDEX events_location_idx ON events USING GIN (to_tsvector('portuguese', location));
-- Índice para busca por título
CREATE INDEX events_title_idx ON events USING GIN (to_tsvector('portuguese', title));
-- Índice para busca por descrição
CREATE INDEX events_description_idx ON events USING GIN (to_tsvector('portuguese', description));

-- Tabela de inscrições em eventos
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'confirmed' NOT NULL, -- 'pending', 'confirmed', 'cancelled'
  payment_status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'paid', 'refunded'
  amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id) -- Um usuário só pode se inscrever uma vez em cada evento
);

-- Trigger para atualizar o contador de participantes quando uma nova inscrição é feita
CREATE OR REPLACE FUNCTION public.update_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE events SET participants = participants + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    UPDATE events SET participants = participants + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE events SET participants = participants - 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE events SET participants = participants - 1 WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_registration_change
  AFTER INSERT OR UPDATE OR DELETE ON registrations
  FOR EACH ROW EXECUTE PROCEDURE public.update_event_participants();

-- Configurações de segurança (RLS - Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para organizadores (apenas administradores podem gerenciar)
CREATE POLICY "Qualquer um pode ver organizadores" ON organizers
  FOR SELECT USING (true);

-- Políticas para eventos
CREATE POLICY "Qualquer um pode ver eventos" ON events
  FOR SELECT USING (true);

-- Políticas para inscrições
CREATE POLICY "Usuários podem ver suas próprias inscrições" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias inscrições" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias inscrições" ON registrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias inscrições" ON registrations
  FOR DELETE USING (auth.uid() = user_id);
