class String
  def is_a_number?
    !!(self =~ /\A[+-]?\d+?(\.\d+)?\Z/)
  end
end