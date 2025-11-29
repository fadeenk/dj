-- Enable Realtime for requests table
alter publication supabase_realtime add table requests;

-- Create increment_upvotes RPC function
create or replace function increment_upvotes(row_id uuid)
returns void as $$
begin
  update requests
  set upvotes = upvotes + 1
  where id = row_id;
end;
$$ language plpgsql;
